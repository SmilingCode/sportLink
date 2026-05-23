import { z } from "zod";

const plainEmailSchema = z.string().email();
const displayEmailRegex = /^[^<>]+<\s*[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+\s*>$/;

const resendFromEmailSchema = z
  .string()
  .default("SportLink <noreply@localhost.dev>")
  .refine(
    (value) => plainEmailSchema.safeParse(value).success || displayEmailRegex.test(value),
    "RESEND_FROM_EMAIL must be a valid email or 'Name <email@domain.com>'",
  );

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
  RESEND_FROM_EMAIL: resendFromEmailSchema,
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  TWILIO_ACCOUNT_SID: z.string().startsWith("AC").optional(),
  TWILIO_AUTH_TOKEN: z.string().min(8).optional(),
  TWILIO_VERIFY_SERVICE_SID: z.string().startsWith("VA").optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
