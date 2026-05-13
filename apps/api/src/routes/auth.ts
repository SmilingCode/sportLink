import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "../lib/db.js";
import { authenticate } from "../lib/auth.js";

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  // POST /auth/signup
  app.post("/signup", async (request, reply) => {
    const body = signupSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest(body.error.message);

    const existing = await db.user.findUnique({ where: { email: body.data.email } });
    if (existing) return reply.conflict("Email already registered");

    // In production: hash password with bcrypt
    const user = await db.user.create({
      data: {
        name: body.data.name,
        email: body.data.email,
        passwordHash: body.data.password, // TODO: bcrypt.hash(password, 10)
        verificationStatus: "unverified",
      },
    });

    const token = app.jwt.sign({
      sub: user.id,
      email: user.email,
      verificationStatus: user.verificationStatus,
    });

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

    return { accessToken: token, user };
  });

  // GET /auth/me — return current user from JWT
  app.get("/me", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    const user = await db.user.findUniqueOrThrow({ where: { id: payload.sub } });
    return user;
  });
};
