import type { FastifyRequest, FastifyReply } from "fastify";

const AUTH_COOKIE_NAME = "sportlink_access_token";

function getCookieToken(cookieHeader: string | undefined) {
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = cookie.trim().split("=");
    if (rawName === AUTH_COOKIE_NAME) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return null;
}

function authenticateWithCookieToken(request: FastifyRequest, token: string) {
  try {
    const payload = request.server.jwt.verify(token);
    (request as FastifyRequest & { user: typeof payload }).user = payload;
    return true;
  } catch {
    return false;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (request.headers.authorization) {
      await request.jwtVerify();
      return;
    }

    const tokenFromCookie = getCookieToken(request.headers.cookie);
    if (!tokenFromCookie) {
      reply.unauthorized("Missing authentication credentials");
      return;
    }

    if (authenticateWithCookieToken(request, tokenFromCookie)) {
      return;
    }

    reply.unauthorized("Invalid token");
  } catch {
    reply.unauthorized("Invalid token");
  }
}
