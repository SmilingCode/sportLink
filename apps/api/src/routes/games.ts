import type { FastifyPluginAsync } from "fastify";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "../lib/db.js";
import { authenticate } from "../lib/auth.js";
import { haversineKm, radiusToMetres } from "../lib/geo.js";
import type { CreateGameBody, ListGamesQuery } from "@sportlink/types";

const listQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radiusKm: z.coerce.number().refine((v): v is 10 | 20 | 60 => [10, 20, 60].includes(v)),
  sport: z.enum(["soccer", "basketball", "volleyball", "spikeball"]).optional(),
  skillLevel: z.enum(["beginner", "intermediate", "competitive"]).optional(),
  gender: z.enum(["open", "men", "women", "mixed"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

const createGameSchema = z.object({
  title: z.string().min(3).max(100),
  sport: z.enum(["soccer", "basketball", "volleyball", "spikeball"]),
  skillLevel: z.enum(["beginner", "intermediate", "competitive"]),
  gender: z.enum(["open", "men", "women", "mixed"]),
  dateTime: z.string().datetime(),
  recurring: z.enum(["one_off", "weekly", "fortnightly"]),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
    suburb: z.string(),
  }),
  minPlayers: z.number().int().min(2),
  maxPlayers: z.number().int().min(2),
  costPerPlayer: z.number().int().min(0),
  equipmentNotes: z.string().optional(),
  description: z.string().max(1000).optional(),
});

export const gamesRoutes: FastifyPluginAsync = async (app) => {
  // GET /games — list games within radius
  app.get("/", async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) return reply.badRequest(query.error.message);

    const { lat, lng, radiusKm, sport, skillLevel, gender, page, limit } = query.data;

    // PostGIS raw query for radius filtering
    const offset = (page - 1) * limit;
    const radiusMetres = radiusToMetres(radiusKm);
    const sportFilter = sport ? Prisma.sql`AND g.sport = ${sport}` : Prisma.empty;
    const skillLevelFilter = skillLevel
      ? Prisma.sql`AND g."skillLevel" = ${skillLevel}`
      : Prisma.empty;
    const genderFilter = gender ? Prisma.sql`AND g.gender = ${gender}` : Prisma.empty;

    // Using Prisma $queryRaw with PostGIS ST_DWithin
    const games = await db.$queryRaw<any[]>`
      SELECT
        g.*,
        u.id as host_id,
        u.name as host_name,
        u."avatarUrl" as host_avatar,
        u."verificationStatus" as host_verification,
        (SELECT COUNT(*) FROM "GameMember" gm WHERE gm."gameId" = g.id) as current_players,
        ST_Distance(
          ST_MakePoint(g.lng, g.lat)::geography,
          ST_MakePoint(${lng}, ${lat})::geography
        ) / 1000 as distance_km
      FROM "Game" g
      JOIN "User" u ON g."hostId" = u.id
      WHERE
        ST_DWithin(
          ST_MakePoint(g.lng, g.lat)::geography,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${radiusMetres}
        )
        AND g.status = 'open'
        AND g."dateTime" > NOW()
        ${sportFilter}
        ${skillLevelFilter}
        ${genderFilter}
      ORDER BY distance_km ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return {
      data: games,
      page,
      limit,
      hasMore: games.length === limit,
    };
  });

  // GET /games/:id — single game
  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const game = await db.game.findUnique({
      where: { id },
      include: {
        host: {
          select: { id: true, name: true, avatarUrl: true, verificationStatus: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true, verificationStatus: true },
            },
          },
        },
      },
    });
    if (!game) return reply.notFound("Game not found");
    return game;
  });

  // POST /games — create a game (auth required + must be verified)
  app.post("/", { preHandler: authenticate }, async (request, reply) => {
    const user = request.user as { sub: string; verificationStatus: string };
    if (user.verificationStatus !== "fully_verified") {
      return reply.forbidden("You must be fully verified to create a game");
    }

    const body = createGameSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest(body.error.message);

    const game = await db.game.create({
      data: {
        ...body.data,
        lat: body.data.location.lat,
        lng: body.data.location.lng,
        address: body.data.location.address,
        suburb: body.data.location.suburb,
        hostId: user.sub,
        status: "open",
      },
    });
    return reply.code(201).send(game);
  });

  // POST /games/:id/join
  app.post("/:id/join", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { sub: string; verificationStatus: string };

    if (user.verificationStatus !== "fully_verified") {
      return reply.forbidden("You must be fully verified to join a game");
    }

    const game = await db.game.findUnique({ where: { id } });
    if (!game) return reply.notFound("Game not found");

    const memberCount = await db.gameMember.count({ where: { gameId: id } });
    if (memberCount >= game.maxPlayers) return reply.conflict("Game is full");

    const existing = await db.gameMember.findUnique({
      where: { gameId_userId: { gameId: id, userId: user.sub } },
    });
    if (existing) return reply.conflict("Already joined this game");

    await db.gameMember.create({ data: { gameId: id, userId: user.sub } });
    return reply.code(201).send({ joined: true });
  });

  // DELETE /games/:id/leave
  app.delete("/:id/leave", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { sub: string };

    await db.gameMember.delete({
      where: { gameId_userId: { gameId: id, userId: user.sub } },
    });
    return { left: true };
  });
};
