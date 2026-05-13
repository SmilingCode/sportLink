import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";

import { gamesRoutes } from "./routes/games.js";
import { usersRoutes } from "./routes/users.js";
import { verifyRoutes } from "./routes/verify.js";
import { notifyRoutes } from "./routes/notify.js";
import { authRoutes } from "./routes/auth.js";
import { env } from "./lib/env.js";

const app = Fastify({ logger: true });

// ─── Plugins ──────────────────────────────────────────────────────────────────

await app.register(cors, {
  origin: env.FRONTEND_URL,
  credentials: true,
});

await app.register(jwt, {
  secret: env.JWT_SECRET,
});

await app.register(sensible);

// ─── Routes ───────────────────────────────────────────────────────────────────

await app.register(authRoutes, { prefix: "/auth" });
await app.register(gamesRoutes, { prefix: "/games" });
await app.register(usersRoutes, { prefix: "/users" });
await app.register(verifyRoutes, { prefix: "/verify" });
await app.register(notifyRoutes, { prefix: "/notify" });

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

// ─── Start ────────────────────────────────────────────────────────────────────

try {
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  console.log(`SportLink API running on port ${env.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
