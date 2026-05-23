import { ArrowLeft, Check, ChevronDown, ChevronUp } from "lucide-react";

type EmailVerificationCardProps = {
  index: number;
  email: string;
  complete: boolean;
  open: boolean;
  isResending: boolean;
  resendMessage: string | null;
  onResend: () => void;
  onBackToInstructions: () => void;
  onToggle: () => void;
};

export default function EmailVerificationCard({
  index,
  email,
  complete,
  open,
  isResending,
  resendMessage,
  onResend,
  onBackToInstructions,
  onToggle,
}: EmailVerificationCardProps) {
  const headerClassName = "flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5";
  const isResendSuccess =
    resendMessage?.includes("Confirmation email sent again") ||
    resendMessage?.includes("Email resent to");

  return (
    <div
      className={`overflow-hidden border ${
        complete ? "rounded-2xl" : open ? "rounded-[2rem]" : "rounded-2xl"
      } ${
        complete
          ? "border-[rgba(0,200,148,0.36)] bg-[#2a2a27]"
          : `${open ? "border-[rgba(0,200,148,0.55)] bg-[#2b2a28]" : "border-[var(--sportlink-border)] bg-[#2a2a27]"}`
      }`}
    >
      {complete ? (
        <div className={headerClassName}>
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
              open
                ? "bg-[rgba(0,200,148,0.18)] text-[var(--sportlink-green)]"
                : "bg-[var(--sportlink-green)] text-[#f4fbf7]"
            }`}
          >
            <Check className="h-5 w-5" strokeWidth={2.25} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold tracking-[-0.02em] text-[#f1efe8]">
              Email verification
            </div>
            <p className="truncate text-sm text-[var(--sportlink-text-soft)]">
              {complete ? `Confirmed · ${email}` : `Waiting for confirmation · ${email}`}
            </p>
          </div>
          <span className="text-sm font-semibold text-[var(--sportlink-green)]">Complete</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className={headerClassName}
          aria-expanded={open}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
              !open
                ? "bg-[rgba(0,200,148,0.18)]"
                : "bg-[var(--sportlink-green)] text-[#f4fbf7]"
            }`}
          >
            {index}
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
            {open ? (
              <ChevronUp className="h-6 w-6" strokeWidth={2.2} />
            ) : (
              <ChevronDown className="h-6 w-6" strokeWidth={2.2} />
            )}
          </div>
        </button>
      )}

      {!complete && open ? (
        <>
          <div className="h-px bg-[#4d4a44]" />

          {isResendSuccess ? (
            <div className="space-y-5 px-5 py-5 sm:px-8">
              <div className="flex items-center gap-3 rounded-xl border border-[rgba(0,200,148,0.8)] bg-[rgba(0,120,90,0.22)] px-4 py-4 text-[var(--sportlink-green)]">
                <Check className="h-5 w-5" strokeWidth={2.25} />
                <p className="text-sm font-medium sm:text-base">
                  Email resent to <span className="font-semibold">{email}</span>. Check your inbox
                  and spam folder.
                </p>
              </div>

              <p className="text-sm leading-6 text-[var(--sportlink-text-soft)] sm:text-[16px]">
                Still nothing after a minute? Check your spam folder, or try a different email
                address.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onBackToInstructions}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#57544e] px-4 py-2 text-sm font-semibold text-[#f3f2ee] transition hover:border-[#6a6660] hover:bg-[#31302d]"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.3} />
                  Back
                </button>
              </div>
            </div>
          ) : (
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
                    Come back here - this step updates automatically
                  </InstructionItem>
                </ol>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onResend}
                  disabled={isResending}
                  className="rounded-xl border border-[#57544e] px-4 py-2 text-sm font-semibold text-[#f3f2ee] transition hover:border-[#6a6660] hover:bg-[#31302d]"
                >
                  {isResending ? "Sending..." : "Resend confirmation email"}
                </button>
              </div>

              {resendMessage ? (
                <p className="text-sm text-[var(--sportlink-text-soft)]">{resendMessage}</p>
              ) : null}
            </div>
          )}
        </>
      ) : null}
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
