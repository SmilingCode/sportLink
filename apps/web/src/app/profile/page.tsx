"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, Mail } from "lucide-react";
import type { UserDTO } from "@sportlink/types";
import { getStoredSession } from "@/lib/auth";

type VerificationStep = {
  title: string;
  detail: string;
  complete: boolean;
  actionLabel?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [emailCardOpen, setEmailCardOpen] = useState(true);

  useEffect(() => {
    const session = getStoredSession();

    if (!session) {
      router.replace("/auth/login?next=%2Fprofile");
      return;
    }

    setUser(session.user);
    setAuthChecked(true);
  }, [router]);

  if (!authChecked) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-6 sm:px-8">
        <p className="text-sm text-[var(--sportlink-text-soft)]">Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const verificationState = getVerificationState(user.verificationStatus);
  const verificationSteps = buildVerificationSteps(verificationState);
  const joinedMonth = new Date(user.createdAt).toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });
  const locationLabel = user.location?.suburb
    ? `${user.location.suburb}${user.location.suburb.includes(",") ? "" : ", NSW"}`
    : "Location not set";

  return (
    <main className="mx-auto max-w-6xl px-6 py-6 sm:px-8">
      <section className="space-y-4">
        <div className="rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar initials={getInitials(user.name)} />
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#f1efe8] sm:text-3xl">
                  {user.name}
                </h1>
                <p className="mt-1 text-sm text-[var(--sportlink-text-soft)]">
                  {locationLabel} · Joined {joinedMonth}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:min-w-[22rem]">
              <Stat label="games joined" value={String(user.gamesJoined ?? 0)} />
              <Stat label="games hosted" value={String(user.gamesHosted ?? 0)} />
              <Stat label="verified" value={verificationSummary(user.verificationStatus)} />
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-[#f1efe8]">Identity verification</h2>
            <p className="text-sm text-[var(--sportlink-text-soft)]">
              Complete all steps to join and create verified games.
            </p>
          </div>

          <div className="space-y-3">
            <EmailVerificationCard
              email={user.email}
              complete={verificationState.emailVerified}
              open={emailCardOpen}
              onToggle={() => setEmailCardOpen((current) => !current)}
            />
            {verificationSteps.map((step, index) => (
              <VerificationRow key={step.title} step={step} index={index + 2} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function getVerificationState(status: UserDTO["verificationStatus"]) {
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

function buildVerificationSteps(state: ReturnType<typeof getVerificationState>): VerificationStep[] {
  return [
    {
      title: "Phone number verification",
      detail: "+61 4•• ••• •••",
      complete: state.phoneVerified,
      actionLabel: state.phoneVerified ? undefined : "Start →",
    },
    {
      title: "Government ID verification",
      detail: "Upload a passport or driver's licence",
      complete: state.idVerified,
      actionLabel: state.idVerified ? undefined : "Start →",
    },
    {
      title: "Selfie verification",
      detail: "Take a selfie to verify your identity",
      complete: false,
      actionLabel: "Start →",
    },
  ];
}

function verificationSummary(status: UserDTO["verificationStatus"]) {
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

function EmailVerificationCard({
  email,
  complete,
  open,
  onToggle,
}: {
  email: string;
  complete: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[2rem] border ${
        complete
          ? "border-[rgba(0,200,148,0.28)] bg-[#2b2a28]"
          : "border-[rgba(0,200,148,0.75)] bg-[#2b2a28]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-7"
        aria-expanded={open}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            complete
              ? "bg-[rgba(0,200,148,0.18)] text-[var(--sportlink-green)]"
              : "bg-[var(--sportlink-green)] text-[#f4fbf7]"
          }`}
        >
          {complete ? <Check className="h-5 w-5" strokeWidth={2.25} /> : 1}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold tracking-[-0.02em] text-[#f1efe8]">
            Email verification
          </div>
          <p className="truncate text-sm text-[var(--sportlink-text-soft)]">
            {complete ? `Confirmed · ${email}` : `Waiting for confirmation · ${email}`}
          </p>
        </div>

        <div className="text-[#66635d]">
          {open ? <ChevronUp className="h-6 w-6" strokeWidth={2.2} /> : <ChevronDown className="h-6 w-6" strokeWidth={2.2} />}
        </div>
      </button>

      {!complete && open ? (
        <>
          <div className="h-px bg-[#302f2b]" />

          <div className="space-y-4 px-5 py-5 sm:px-8">
            <p className="text-sm leading-6 text-[var(--sportlink-text-soft)]">
              A confirmation email was sent to <span className="font-semibold text-[#f1efe8]">{email}</span>. Click the link inside to confirm your email address.
            </p>

            <div className="rounded-[1.35rem] bg-[#1f1e1d] px-5 py-5">
              <ol className="space-y-4">
                <InstructionItem index={1}>
                  Check your inbox (and spam folder) for an email from SportLink
                </InstructionItem>
                <InstructionItem index={2}>Click "Confirm my email" in the email</InstructionItem>
                <InstructionItem index={3}>
                  Come back here — this step updates automatically
                </InstructionItem>
              </ol>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl border border-[#57544e] px-4 py-2 text-sm font-semibold text-[#f3f2ee] transition hover:border-[#6a6660] hover:bg-[#31302d]"
              >
                Resend confirmation email
              </button>
              <button
                type="button"
                className="rounded-xl border border-[#57544e] px-4 py-2 text-sm font-semibold text-[#f3f2ee] transition hover:border-[#6a6660] hover:bg-[#31302d]"
              >
                Wrong email address?
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,200,148,0.18)] text-2xl font-semibold text-[var(--sportlink-green)] sm:h-20 sm:w-20">
      {initials}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--sportlink-border)] bg-[#2a2a27] px-3 py-3 text-center">
      <div className="text-lg font-semibold text-[#f1efe8]">{value}</div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--sportlink-text-soft)]">
        {label}
      </div>
    </div>
  );
}

function VerificationRow({ step, index }: { step: VerificationStep; index: number }) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border px-4 py-4 sm:px-5 ${
        step.complete
          ? "border-[rgba(0,200,148,0.36)] bg-[#2a2a27]"
          : "border-[var(--sportlink-border)] bg-[#2a2a27]"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
          step.complete
            ? "bg-[rgba(0,200,148,0.18)] text-[var(--sportlink-green)]"
            : "bg-[rgba(0,200,148,0.16)] text-[#d9f6ec]"
        }`}
      >
        {step.complete ? <Check className="h-5 w-5" strokeWidth={2.25} /> : index}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[#f1efe8]">{step.title}</div>
        <div className="truncate text-sm text-[var(--sportlink-text-soft)]">{step.detail}</div>
      </div>

      {step.actionLabel ? (
        <button
          type="button"
          className="rounded-xl border border-[#6f6e67] px-4 py-2 text-sm font-semibold text-[#f3f2ee] transition hover:border-[#8a887f] hover:bg-[#31312d]"
        >
          {step.actionLabel}
        </button>
      ) : (
        <span className="text-sm font-semibold text-[var(--sportlink-green)]">Complete</span>
      )}
    </div>
  );
}

function InstructionItem({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-4 text-sm text-[#adaba5] sm:text-[15px]">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#313030] text-xs font-semibold text-[#8c8a84]">
        {index}
      </span>
      <span>{children}</span>
    </li>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
