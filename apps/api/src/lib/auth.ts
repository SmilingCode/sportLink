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
    const tokenFromCookie = getCookieToken(request.headers.cookie);
    if (tokenFromCookie && !request.headers.authorization) {
      request.headers.authorization = `Bearer ${tokenFromCookie}`;
    }

    await request.jwtVerify();
  } catch {
    reply.unauthorized("Invalid or missing token");
  }
}
