import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { createHash, randomBytes } from "node:crypto";
import { Resend } from "resend";
import { z } from "zod";
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
  return `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; ${secure}SameSite=Lax; Max-Age=604800`;
}

function clearAuthCookie() {
  const secure = env.NODE_ENV === "production" ? "Secure; " : "";
  return `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; ${secure}SameSite=Lax; Max-Age=0`;
}

function generateEmailVerificationToken() {
  return randomBytes(24).toString("hex");
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function sendVerificationEmail(to: string, token: string, app: FastifyInstance) {
  const verifyUrl = new URL("/verify/email", env.FRONTEND_URL);
  verifyUrl.searchParams.set("token", token);

  if (!resend) {
    app.log.warn(
      { to, verifyUrl: verifyUrl.toString() },
      "RESEND_API_KEY is missing; skipping verification email send",
    );
    return;
  }

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: "Verify your SportLink email",
    html: `
      <p>Welcome to SportLink.</p>
      <p>Please verify your email by clicking the link below. This link expires in 24 hours.</p>
      <p><a href="${verifyUrl.toString()}">Verify email</a></p>
    `,
  });
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
    return reply.code(201).send({ accessToken: token, user });
  });

  // POST /auth/login
  app.post("/login", async (request, reply) => {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest(body.error.message);

    const user = await db.user.findUnique({ where: { email: body.data.email } });
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
    return { accessToken: token, user };
  });

  // GET /auth/me — return current user from JWT
  app.get("/me", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    const user = await db.user.findUniqueOrThrow({ where: { id: payload.sub } });
    return user;
  });

  app.post("/logout", async (_request, reply) => {
    reply.header("Set-Cookie", clearAuthCookie());
    return { loggedOut: true };
  });

  // GET /auth/verify-email?token=...
  app.get("/verify-email", async (request, reply) => {
    const query = verifyEmailQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest("Missing or invalid token");

    const tokenHash = hashToken(query.data.token);
    const now = new Date();

    const user = await db.user.findFirst({
      where: {
        emailVerifyToken: tokenHash,
        emailVerifyExpiry: {
          gt: now,
        },
      },
    });

    if (!user) {
      return reply.badRequest("Invalid or expired verification token");
    }

    const verificationStatus =
      user.verificationStatus === "fully_verified" ? "fully_verified" : "email_verified";

    await db.user.update({
      where: { id: user.id },
      data: {
        verificationStatus,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    return { verified: true };
  });
};
