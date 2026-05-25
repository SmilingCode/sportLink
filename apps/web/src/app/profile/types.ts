export type VerificationStep = {
  id: "email" | "phone" | "id" | "selfie";
  kind: "email" | "standard";
  title: string;
  detail: string;
  complete: boolean;
  actionLabel?: string;
};
