import type { FastifyPluginAsync } from "fastify";
import Stripe from "stripe";
import { db } from "../lib/db.js";
import { env } from "../lib/env.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const verifyRoutes: FastifyPluginAsync = async (app) => {
  /**
   * POST /verify/session — create a Stripe Identity verification session.
   * Frontend calls this, gets back a client_secret, then opens the
   * Stripe Identity modal client-side.
   */
  app.post("/session", async (request, reply) => {
    const payload = request.user as { sub: string; email: string } | undefined;
    if (!payload) return reply.unauthorized();

    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: { userId: payload.sub },
      options: {
        document: {
          require_matching_selfie: true,
        },
      },
    });

    return { clientSecret: session.client_secret };
  });

  /**
   * POST /verify/webhook — Stripe sends events here after verification.
   * Registered in Stripe Dashboard → Webhooks.
   * Must be raw body (not parsed JSON) for signature verification.
   */
  app.post(
    "/webhook",
    {
      config: { rawBody: true }, // requires @fastify/rawbody plugin
    },
    async (request, reply) => {
      const sig = request.headers["stripe-signature"] as string;

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          (request as any).rawBody,
          sig,
          env.STRIPE_WEBHOOK_SECRET,
        );
      } catch {
        return reply.badRequest("Invalid webhook signature");
      }

      if (event.type === "identity.verification_session.verified") {
        const session = event.data.object as Stripe.Identity.VerificationSession;
        const userId = session.metadata?.userId;

        if (userId) {
          await db.user.update({
            where: { id: userId },
            data: { verificationStatus: "fully_verified" },
          });
        }
      }

      if (event.type === "identity.verification_session.requires_input") {
        // Verification failed — optionally notify user
        const session = event.data.object as Stripe.Identity.VerificationSession;
        app.log.warn({ session }, "Verification failed for user");
      }

      return { received: true };
    },
  );
};
