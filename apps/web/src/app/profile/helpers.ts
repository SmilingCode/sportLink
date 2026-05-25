import type { UserDTO } from "@sportlink/types";
import type { VerificationStep } from "./types";

export function getVerificationState(status: UserDTO["verificationStatus"]) {
  const emailVerified =
    status === "email_verified" ||
    status === "phone_verified" ||
    status === "id_verified" ||
    status === "fully_verified";
  const phoneVerified =
    status === "phone_verified" || status === "id_verified" || status === "fully_verified";
  const idVerified = status === "id_verified" || status === "fully_verified";

  return {
    emailVerified,
    phoneVerified,
    idVerified,
  };
}

export function buildVerificationSteps(
  state: ReturnType<typeof getVerificationState>,
  email: string,
  idDetail = "Upload a passport or driver's licence",
): VerificationStep[] {
  return [
    {
      id: "email",
      kind: "email",
      title: "Email verification",
      detail: email,
      complete: state.emailVerified,
    },
    {
      id: "phone",
      kind: "standard",
      title: "Phone number verification",
      detail: "Verify with a 6-digit SMS code",
      complete: state.phoneVerified,
      actionLabel: state.phoneVerified ? undefined : "Start →",
    },
    {
      id: "id",
      kind: "standard",
      title: "Government ID verification",
      detail: idDetail,
      complete: state.idVerified,
      actionLabel: state.idVerified ? undefined : "Start →",
    },
    {
      id: "selfie",
      kind: "standard",
      title: "Selfie verification",
      detail: "Take a selfie to verify your identity",
      complete: false,
      actionLabel: "Start →",
    },
  ];
}

export function verificationSummary(status: UserDTO["verificationStatus"]) {
  switch (status) {
    case "fully_verified":
      return "3/3";
    case "id_verified":
      return "2/3";
    case "phone_verified":
      return "2/3";
    case "email_verified":
      return "1/3";
    default:
      return "0/3";
  }
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
