import { Check } from "lucide-react";
import EmailVerificationCard from "@/components/EmailVerificationCard";
import PhoneVerificationCard from "@/components/PhoneVerificationCard";
import type { VerificationStep } from "../types";

type VerificationSectionProps = {
  verificationSteps: VerificationStep[];
  expandedSteps: Record<string, boolean>;
  isResendingEmail: boolean;
  resendMessage: string | null;
  phoneCardOpen: boolean;
  phoneInput: string;
  phoneInputError: string | null;
  maskedPhoneLabel: string;
  isSendDisabled: boolean;
  isVerifyDisabled: boolean;
  phoneCodeSent: boolean;
  phoneCodeDigits: string[];
  phoneCodeError: string | null;
  isSendingPhoneCode: boolean;
  isVerifyingPhoneCode: boolean;
  phoneSendMessage: string | null;
  isStartingIdVerification: boolean;
  idVerificationError: string | null;
  idVerificationStatus: "not_started" | "under_review" | "review_failed" | "verified" | "canceled" | null;
  onResendEmail: () => void;
  onBackToEmailInstructions: () => void;
  onToggleStep: (stepId: string) => void;
  onStartPhoneVerification: () => void;
  onPhoneInputChange: (value: string) => void;
  onPhoneInputBlur: () => void;
  onCodeDigitChange: (index: number, value: string) => void;
  onCodeBulkFill: (digits: string[]) => void;
  onChangePhoneNumber: () => void;
  onSendPhoneCode: () => void;
  onResendPhoneCode: () => void;
  onVerifyPhoneCode: () => void;
  onStartIdVerification: () => void;
};

export default function VerificationSection({
  verificationSteps,
  expandedSteps,
  isResendingEmail,
  resendMessage,
  phoneCardOpen,
  phoneInput,
  phoneInputError,
  maskedPhoneLabel,
  isSendDisabled,
  isVerifyDisabled,
  phoneCodeSent,
  phoneCodeDigits,
  phoneCodeError,
  isSendingPhoneCode,
  isVerifyingPhoneCode,
  phoneSendMessage,
  isStartingIdVerification,
  idVerificationError,
  idVerificationStatus,
  onResendEmail,
  onBackToEmailInstructions,
  onToggleStep,
  onStartPhoneVerification,
  onPhoneInputChange,
  onPhoneInputBlur,
  onCodeDigitChange,
  onCodeBulkFill,
  onChangePhoneNumber,
  onSendPhoneCode,
  onResendPhoneCode,
  onVerifyPhoneCode,
  onStartIdVerification,
}: VerificationSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-[#f1efe8]">Identity verification</h2>
        <p className="text-sm text-[var(--sportlink-text-soft)]">
          Complete all steps to join and create verified games.
        </p>
      </div>

      <div className="space-y-3">
        {verificationSteps.map((step, index) =>
          step.kind === "email" ? (
            <EmailVerificationCard
              key={step.id}
              index={index + 1}
              email={step.detail}
              complete={step.complete}
              open={expandedSteps[step.id] ?? true}
              isResending={isResendingEmail}
              resendMessage={resendMessage}
              onResend={onResendEmail}
              onBackToInstructions={onBackToEmailInstructions}
              onToggle={() => onToggleStep(step.id)}
            />
          ) : step.id === "phone" && !step.complete ? (
            <PhoneVerificationCard
              key={step.id}
              index={index + 1}
              open={phoneCardOpen}
              phoneInput={phoneInput}
              phoneInputError={phoneInputError}
              maskedPhoneLabel={maskedPhoneLabel}
              isSendDisabled={isSendDisabled}
              isVerifyDisabled={isVerifyDisabled}
              phoneCodeSent={phoneCodeSent}
              phoneCodeDigits={phoneCodeDigits}
              phoneCodeError={phoneCodeError}
              isSendingPhoneCode={isSendingPhoneCode}
              isVerifyingPhoneCode={isVerifyingPhoneCode}
              sendMessage={phoneSendMessage}
              onStart={onStartPhoneVerification}
              onPhoneInputChange={onPhoneInputChange}
              onPhoneInputBlur={onPhoneInputBlur}
              onCodeDigitChange={onCodeDigitChange}
              onCodeBulkFill={onCodeBulkFill}
              onChangeNumber={onChangePhoneNumber}
              onSendCode={onSendPhoneCode}
              onResendCode={onResendPhoneCode}
              onVerifyCode={onVerifyPhoneCode}
            />
          ) : step.id === "id" && !step.complete ? (
            (() => {
              const isIdAlreadyVerified = idVerificationStatus === "verified";

              return (
                <VerificationRow
                  key={step.id}
                  step={
                    isIdAlreadyVerified
                      ? { ...step, complete: true, actionLabel: undefined }
                      : step
                  }
                  index={index + 1}
                  onAction={isIdAlreadyVerified ? undefined : onStartIdVerification}
                  isLoading={isIdAlreadyVerified ? false : isStartingIdVerification}
                  error={isIdAlreadyVerified ? null : idVerificationError}
                />
              );
            })()
          ) : (
            <VerificationRow key={step.id} step={step} index={index + 1} />
          ),
        )}
      </div>
    </section>
  );
}

function VerificationRow({
  step,
  index,
  onAction,
  isLoading = false,
  error,
}: {
  step: VerificationStep;
  index: number;
  onAction?: () => void;
  isLoading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="space-y-2">
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
            onClick={onAction}
            disabled={isLoading}
            className="rounded-xl border border-[#6f6e67] px-4 py-2 text-sm font-semibold text-[#f3f2ee] transition hover:border-[#8a887f] hover:bg-[#31312d] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
          >
            {isLoading ? "Starting..." : step.actionLabel}
          </button>
        ) : (
          <span className="text-sm font-semibold text-[var(--sportlink-green)]">Complete</span>
        )}
      </div>

      {error ? <p className="text-sm text-[#ff9b93]">{error}</p> : null}
    </div>
  );
}
