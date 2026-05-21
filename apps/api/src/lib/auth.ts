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

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (request.headers.authorization) {
      await request.jwtVerify();
      return;
    }

    const tokenFromCookie = getCookieToken(request.headers.cookie);
    if (tokenFromCookie) {
      const payload = request.server.jwt.verify(tokenFromCookie);
      (
        request as FastifyRequest & {
          user: typeof payload;
        }
      ).user = payload;
      return;
    }

    reply.unauthorized("Invalid or missing token");
  } catch {
    reply.unauthorized("Invalid or missing token");
  }
}
