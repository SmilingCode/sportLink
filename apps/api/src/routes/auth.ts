import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import type { Prisma } from "@prisma/client";
import { createHash, randomBytes } from "node:crypto";
import { Resend } from "resend";
import { z } from "zod";
import type { UserDTO } from "@sportlink/types";
import { db } from "../lib/db.js";
import { authenticate } from "../lib/auth.js";
import { env } from "../lib/env.js";

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const verifyEmailQuerySchema = z.object({
  token: z.string().min(16),
});

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const AUTH_COOKIE_NAME = "sportlink_access_token";

function authCookie(token: string) {
  const secure = env.NODE_ENV === "production" ? "Secure; " : "";
  return `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; ${secure}SameSite=Lax`;
}

function clearAuthCookie() {
  const secure = env.NODE_ENV === "production" ? "Secure; " : "";
  return `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; ${secure}SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function generateEmailVerificationToken() {
  return randomBytes(24).toString("hex");
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const authUserBaseSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  lat: true,
  lng: true,
  suburb: true,
  verificationStatus: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

const authUserWithCountsSelect = {
  ...authUserBaseSelect,
  _count: {
    select: {
      memberships: true,
      hostedGames: true,
    },
  },
} satisfies Prisma.UserSelect;

const authUserForLoginSelect = {
  ...authUserWithCountsSelect,
  passwordHash: true,
} satisfies Prisma.UserSelect;

type AuthUserBaseRecord = Prisma.UserGetPayload<{ select: typeof authUserBaseSelect }>;
type AuthUserWithCountsRecord = Prisma.UserGetPayload<{
  select: typeof authUserWithCountsSelect;
}>;

function toUserDTO(user: AuthUserBaseRecord | AuthUserWithCountsRecord): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
    location:
      user.lat !== null && user.lng !== null
        ? {
            lat: user.lat,
            lng: user.lng,
            suburb: user.suburb ?? undefined,
          }
        : undefined,
    verificationStatus: user.verificationStatus,
    gamesJoined: "_count" in user ? user._count.memberships : 0,
    gamesHosted: "_count" in user ? user._count.hostedGames : 0,
    createdAt: user.createdAt.toISOString(),
  };
}

async function sendVerificationEmail(to: string, token: string, app: FastifyInstance) {
  const verifyUrl = new URL("/verify/email", env.FRONTEND_URL);
  verifyUrl.searchParams.set("token", token);

  if (!resend) {
    const message = "RESEND_API_KEY is missing";
    app.log.error({ to, verifyUrl: verifyUrl.toString() }, message);
    throw new Error(message);
  }

  const result = (await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: "Verify your SportLink email",
    html: `
      <p>Welcome to SportLink.</p>
      <p>Please verify your email by clicking the link below. This link expires in 24 hours.</p>
      <p><a href="${verifyUrl.toString()}">Verify email</a></p>
    `,
  })) as {
    data?: { id?: string } | null;
    error?: { message?: string } | null;
  };

  if (result.error) {
    throw new Error(result.error.message ?? "Resend rejected the email");
  }

  if (!result.data?.id) {
    throw new Error("Resend did not return a message id");
  }
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  // POST /auth/signup
  app.post("/signup", async (request, reply) => {
    const body = signupSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest(body.error.message);

    const existing = await db.user.findUnique({ where: { email: body.data.email } });
    if (existing) return reply.conflict("Email already registered");

    const rawEmailVerifyToken = generateEmailVerificationToken();
    const emailVerifyToken = hashToken(rawEmailVerifyToken);
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // In production: hash password with bcrypt
    const user = await db.user.create({
      data: {
        name: body.data.name,
        email: body.data.email,
        passwordHash: body.data.password, // TODO: bcrypt.hash(password, 10)
        verificationStatus: "unverified",
        emailVerifyToken,
        emailVerifyExpiry,
      },
      select: authUserBaseSelect,
    });

    try {
      await sendVerificationEmail(user.email, rawEmailVerifyToken, app);
    } catch (error) {
      app.log.error({ err: error, userId: user.id }, "Failed to send verification email");
    }

    const token = app.jwt.sign({
      sub: user.id,
      email: user.email,
      verificationStatus: user.verificationStatus,
    });

    reply.header("Set-Cookie", authCookie(token));
    return reply.code(201).send({ user: toUserDTO(user) });
  });

  // POST /auth/login
  app.post("/login", async (request, reply) => {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest(body.error.message);

    const user = await db.user.findUnique({
      where: { email: body.data.email },
      select: authUserForLoginSelect,
    });
    // In production: bcrypt.compare(body.data.password, user.passwordHash)
    if (!user || user.passwordHash !== body.data.password) {
      return reply.unauthorized("Invalid email or password");
    }

    const token = app.jwt.sign({
      sub: user.id,
      email: user.email,
      verificationStatus: user.verificationStatus,
    });

    reply.header("Set-Cookie", authCookie(token));
    return reply.send({ user: toUserDTO(user) });
  });

  // POST /auth/logout — clear auth cookie
  app.post("/logout", async (_request, reply) => {
    reply.header("Set-Cookie", clearAuthCookie());
    return { loggedOut: true };
  });

  // GET /auth/me — return current user from JWT
  app.get("/me", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    const user = await db.user.findUniqueOrThrow({
      where: { id: payload.sub },
      select: authUserWithCountsSelect,
    });
    return toUserDTO(user);
  });

  // GET /auth/verify-email?token=...
  app.get("/verify-email", async (request, reply) => {
    const query = verifyEmailQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest("Missing or invalid token");

    const tokenHash = hashToken(query.data.token);
    const now = new Date();

    const user = await db.user.findFirst({ where: { emailVerifyToken: tokenHash } });

    if (!user) {
      return reply.badRequest("Invalid or expired verification token");
    }

    const isEmailAlreadyVerified =
      user.verificationStatus === "email_verified" ||
      user.verificationStatus === "phone_verified" ||
      user.verificationStatus === "id_verified" ||
      user.verificationStatus === "fully_verified";

    if (isEmailAlreadyVerified) {
      return { verified: true, alreadyVerified: true };
    }

    if (!user.emailVerifyExpiry || user.emailVerifyExpiry <= now) {
      return reply.badRequest("Invalid or expired verification token");
    }

    const verificationStatus =
      user.verificationStatus === "fully_verified" ? "fully_verified" : "email_verified";

    await db.user.update({
      where: { id: user.id },
      data: {
        verificationStatus,
        emailVerifyExpiry: now,
      },
    });

    return { verified: true };
  });

  // POST /auth/resend-verification — send a fresh verification email for current user
  app.post("/resend-verification", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };

    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return reply.unauthorized();
    }

    const isEmailAlreadyVerified =
      user.verificationStatus === "email_verified" ||
      user.verificationStatus === "phone_verified" ||
      user.verificationStatus === "id_verified" ||
      user.verificationStatus === "fully_verified";

    if (isEmailAlreadyVerified) {
      return reply.badRequest("Email is already verified");
    }

    const rawEmailVerifyToken = generateEmailVerificationToken();
    const emailVerifyToken = hashToken(rawEmailVerifyToken);
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken,
        emailVerifyExpiry,
      },
    });

    try {
      await sendVerificationEmail(user.email, rawEmailVerifyToken, app);
    } catch (error) {
      app.log.error({ err: error, userId: user.id }, "Failed to resend verification email");
      const message =
        error instanceof Error ? error.message : "Could not send verification email";
      return reply.badGateway(`Failed to send verification email: ${message}`);
    }

    return { sent: true };
  });
};
