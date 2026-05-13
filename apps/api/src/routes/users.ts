import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "../lib/db.js";
import { authenticate } from "../lib/auth.js";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      suburb: z.string(),
    })
    .optional(),
});

export const usersRoutes: FastifyPluginAsync = async (app) => {
  // GET /users/:id
  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        verificationStatus: true,
        createdAt: true,
        _count: { select: { hostedGames: true, memberships: true } },
      },
    });
    if (!user) return reply.notFound("User not found");
    return user;
  });

  // PATCH /users/me — update own profile
  app.patch("/me", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const body = updateProfileSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest(body.error.message);

    const data: Record<string, unknown> = {};
    if (body.data.name) data.name = body.data.name;
    if (body.data.location) {
      data.lat = body.data.location.lat;
      data.lng = body.data.location.lng;
      data.suburb = body.data.location.suburb;
    }

    const user = await db.user.update({ where: { id: payload.sub }, data });
    return user;
  });
};
