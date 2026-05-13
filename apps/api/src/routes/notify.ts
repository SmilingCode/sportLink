import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../lib/auth.js";

export const notifyRoutes: FastifyPluginAsync = async (app) => {
  /**
   * POST /notify/game/:id/reminder
   * Manually trigger a reminder for all members of a game.
   * In production this is driven by a cron job (e.g. Inngest / BullMQ).
   */
  app.post(
    "/game/:id/reminder",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      // TODO: query game + members, send via Resend (email) + Twilio (SMS)
      // Example Resend usage:
      // await resend.emails.send({
      //   from: "SportLink <noreply@sportlink.app>",
      //   to: member.email,
      //   subject: `Reminder: ${game.title} is tomorrow`,
      //   html: reminderTemplate(game),
      // });

      app.log.info({ gameId: id }, "Reminder triggered");
      return { queued: true };
    }
  );
};
