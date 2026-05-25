import type { FastifyPluginAsync } from "fastify";
import Stripe from "stripe";
import twilio from "twilio";
import { z } from "zod";
import { db } from "../lib/db.js";
import { authenticate } from "../lib/auth.js";
import { env } from "../lib/env.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const twilioClient =
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
    ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
    : null;

const phoneSendSchema = z.object({
  phone: z.string().min(10).max(14),
});

const phoneCheckSchema = z.object({
  phone: z.string().min(10).max(14),
  code: z.string().regex(/^\d{6}$/),
});

function normalizeAuPhoneToE164(input: string) {
  const digits = input.replace(/\D/g, "");

  if (/^04\d{8}$/.test(digits)) {
    return `+61${digits.slice(1)}`;
  }

  if (/^614\d{8}$/.test(digits)) {
    return `+${digits}`;
  }

  return null;
}

function maskPhoneForDisplay(e164Phone: string) {
  const digits = e164Phone.replace(/\D/g, "");
  if (!/^614\d{8}$/.test(digits)) {
    return e164Phone;
  }

  const mobile = digits.slice(2);
  return `+61 ${mobile[0]}xx xxx xxx`;
}

function nextPhoneVerificationStatus(currentStatus: string) {
  if (currentStatus === "fully_verified") {
    return "fully_verified";
  }

  if (currentStatus === "id_verified") {
    return "fully_verified";
  }

  return "phone_verified";
}

function assertPhoneVerificationEnabled(reply: { serviceUnavailable: (message: string) => unknown }) {
  if (!twilioClient || !env.TWILIO_VERIFY_SERVICE_SID) {
    reply.serviceUnavailable("Phone verification service is not configured.");
    return false;
  }

  return true;
}

function mapIdSessionStatus(session: Stripe.Identity.VerificationSession) {
  if (session.status === "verified") {
    return {
      status: "verified",
      detail: "Identity verified",
    };
  }

  if (session.status === "processing") {
    return {
      status: "under_review",
      detail: "Submitted. Your ID is under review",
    };
  }

  if (session.status === "requires_input") {
    return {
      status: "review_failed",
      detail: "Review failed. Please try again with clearer ID photos",
    };
  }

  if (session.status === "canceled") {
    return {
      status: "canceled",
      detail: "Verification was canceled. Start again when ready",
    };
  }

  return {
    status: "not_started",
    detail: "Upload a passport or driver's licence",
  };
}

export const verifyRoutes: FastifyPluginAsync = async (app) => {
  /**
   * POST /verify/session — create a Stripe Identity verification session.
   * Frontend calls this, gets back a client_secret, then opens the
   * Stripe Identity modal client-side.
   */
  app.post("/session", { preHandler: authenticate }, async (request, reply) => {
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

    await db.user.update({
      where: { id: payload.sub },
      data: { stripeSessionId: session.id },
    });

    return { clientSecret: session.client_secret };
  });

  app.get("/id-status", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string } | undefined;
    if (!payload) {
      return reply.unauthorized();
    }

    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: {
        verificationStatus: true,
        stripeSessionId: true,
      },
    });

    if (!user) {
      return reply.unauthorized();
    }

    if (user.verificationStatus === "id_verified" || user.verificationStatus === "fully_verified") {
      return {
        status: "verified",
        detail: "Identity verified",
      };
    }

    if (!user.stripeSessionId) {
      return {
        status: "not_started",
        detail: "Upload a passport or driver's licence",
      };
    }

    try {
      const session = await stripe.identity.verificationSessions.retrieve(user.stripeSessionId);
      return mapIdSessionStatus(session);
    } catch (error) {
      app.log.error(
        { err: error, userId: payload.sub, stripeSessionId: user.stripeSessionId },
        "Failed to load Stripe ID verification session status",
      );
      return reply.badGateway("Could not load ID verification status.");
    }
  });

  app.post("/phone/send", { preHandler: authenticate }, async (request, reply) => {
    if (!assertPhoneVerificationEnabled(reply)) {
      return;
    }

    const payload = request.user as { sub: string } | undefined;
    if (!payload) {
      return reply.unauthorized();
    }

    const body = phoneSendSchema.safeParse(request.body);
    if (!body.success) {
      return reply.badRequest("Invalid phone number.");
    }

    const normalizedPhone = normalizeAuPhoneToE164(body.data.phone);
    if (!normalizedPhone) {
      return reply.badRequest("Enter a valid AU mobile number.");
    }

    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: { verificationStatus: true },
    });

    if (!user) {
      return reply.unauthorized();
    }

    const hasEmailVerification =
      user.verificationStatus === "email_verified" ||
      user.verificationStatus === "phone_verified" ||
      user.verificationStatus === "id_verified" ||
      user.verificationStatus === "fully_verified";

    if (!hasEmailVerification) {
      return reply.badRequest("Verify your email before phone verification.");
    }

    try {
      await twilioClient!.verify.v2
        .services(env.TWILIO_VERIFY_SERVICE_SID!)
        .verifications.create({
          to: normalizedPhone,
          channel: "sms",
        });
    } catch (error) {
      app.log.error({ err: error, userId: payload.sub }, "Failed to send phone verification code");
      return reply.badGateway("Failed to send SMS code.");
    }

    return { sent: true, maskedPhone: maskPhoneForDisplay(normalizedPhone) };
  });

  app.post("/phone/check", { preHandler: authenticate }, async (request, reply) => {
    if (!assertPhoneVerificationEnabled(reply)) {
      return;
    }

    const payload = request.user as { sub: string } | undefined;
    if (!payload) {
      return reply.unauthorized();
    }

    const body = phoneCheckSchema.safeParse(request.body);
    if (!body.success) {
      return reply.badRequest("Invalid verification code.");
    }

    const normalizedPhone = normalizeAuPhoneToE164(body.data.phone);
    if (!normalizedPhone) {
      return reply.badRequest("Enter a valid AU mobile number.");
    }

    try {
      const check = await twilioClient!.verify.v2
        .services(env.TWILIO_VERIFY_SERVICE_SID!)
        .verificationChecks.create({
          to: normalizedPhone,
          code: body.data.code,
        });

      if (check.status !== "approved") {
        return reply.badRequest("Invalid or expired verification code.");
      }
    } catch (error) {
      app.log.error(
        { err: error, userId: payload.sub },
        "Failed to confirm phone verification code",
      );
      return reply.badGateway("Could not verify the SMS code.");
    }

    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: { verificationStatus: true },
    });

    if (!user) {
      return reply.unauthorized();
    }

    await db.user.update({
      where: { id: payload.sub },
      data: {
        phone: normalizedPhone,
        verificationStatus: nextPhoneVerificationStatus(user.verificationStatus),
      },
    });

    return { verified: true };
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
