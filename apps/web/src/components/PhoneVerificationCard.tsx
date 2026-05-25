import { useRef } from "react";
import { maskAuMobileForDisplay } from "@/lib/verification";

type PhoneVerificationCardProps = {
  index: number;
  open: boolean;
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
  sendMessage: string | null;
  onStart: () => void;
  onPhoneInputChange: (value: string) => void;
  onPhoneInputBlur: () => void;
  onCodeDigitChange: (index: number, value: string) => void;
  onCodeBulkFill: (digits: string[]) => void;
  onChangeNumber: () => void;
  onSendCode: () => void;
  onResendCode: () => void;
  onVerifyCode: () => void;
};

export default function PhoneVerificationCard({
  index,
  open,
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
  sendMessage,
  onStart,
  onPhoneInputChange,
  onPhoneInputBlur,
  onCodeDigitChange,
  onCodeBulkFill,
  onChangeNumber,
  onSendCode,
  onResendCode,
  onVerifyCode,
}: PhoneVerificationCardProps) {
  const codeInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  if (!open) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-[var(--sportlink-border)] bg-[#2a2a27] px-4 py-4 sm:px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(0,200,148,0.16)] text-sm font-semibold text-[#d9f6ec]">
          {index}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-semibold text-[#f1efe8]">Phone number verification</div>
          <div className="truncate text-sm text-[var(--sportlink-text-soft)]">
            Verify with a 6-digit SMS code
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="rounded-xl border border-[#6f6e67] px-4 py-2 text-sm font-semibold text-[#f3f2ee] transition hover:border-[#8a887f] hover:bg-[#31312d]"
        >
          Start →
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[rgba(0,200,148,0.55)] bg-[#2b2a28]">
      <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--sportlink-green)] text-sm font-semibold text-[#f4fbf7]">
          {index}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold tracking-[-0.02em] text-[#f1efe8]">
            Phone number verification
          </div>
          <p className="truncate text-sm text-[var(--sportlink-text-soft)]">
            Verify with a 6-digit SMS code
          </p>
        </div>
      </div>

      <div className="h-px bg-[#3d3a35]" />

      <div className="space-y-4 px-4 py-5 sm:px-5 sm:py-6">
        {!phoneCodeSent ? (
          <>
            <p className="text-sm text-[var(--sportlink-text-soft)] sm:text-[16px]">
              We&apos;ll send a one-time code to your mobile number.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={phoneInput}
                onChange={(event) => onPhoneInputChange(event.target.value)}
                onBlur={onPhoneInputBlur}
                placeholder="0412345678"
                className={`h-14 w-full rounded-2xl border bg-[#2f2e2c] px-5 text-base text-[#f1efe8] outline-none transition placeholder:text-[#7e7b74] ${
                  phoneInputError
                    ? "border-[#9d4a44] focus:border-[#d4645b]"
                    : "border-[#4a4842] focus:border-[rgba(0,200,148,0.7)]"
                }`}
                autoComplete="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-invalid={phoneInputError ? true : false}
                aria-describedby={phoneInputError ? "phone-input-error" : undefined}
              />

              <button
                type="button"
                onClick={onSendCode}
                disabled={isSendDisabled}
                className="h-14 shrink-0 rounded-2xl border border-[#57544e] px-6 text-lg font-semibold text-[#f3f2ee] transition hover:border-[#6a6660] hover:bg-[#31302d] disabled:cursor-not-allowed disabled:border-[#4a4842] disabled:text-[#8e8a83] disabled:hover:bg-transparent"
              >
                {isSendingPhoneCode ? "Sending..." : "Send code"}
              </button>
            </div>

            {phoneInputError ? (
              <p id="phone-input-error" className="text-sm text-[#ff9b93]">
                {phoneInputError}
              </p>
            ) : null}

            {sendMessage ? <p className="text-sm text-[#ff9b93]">{sendMessage}</p> : null}
          </>
        ) : (
          <>
            <p className="text-sm text-[var(--sportlink-text-soft)] sm:text-[16px]">
              Code sent to {maskedPhoneLabel || maskAuMobileForDisplay(phoneInput)}. Enter it below.
            </p>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {phoneCodeDigits.map((digit, boxIndex) => (
                <input
                  key={boxIndex}
                  ref={(element) => {
                    codeInputRefs.current[boxIndex] = element;
                  }}
                  type="text"
                  value={digit}
                  onChange={(event) => {
                    const nextDigit = event.target.value.replace(/\D/g, "").slice(-1);
                    onCodeDigitChange(boxIndex, nextDigit);

                    if (nextDigit && boxIndex < phoneCodeDigits.length - 1) {
                      codeInputRefs.current[boxIndex + 1]?.focus();
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !phoneCodeDigits[boxIndex] && boxIndex > 0) {
                      codeInputRefs.current[boxIndex - 1]?.focus();
                    }
                  }}
                  onPaste={(event) => {
                    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    if (pasted.length === 0) {
                      return;
                    }

                    event.preventDefault();
                    const filledDigits = Array(6)
                      .fill("")
                      .map((_, idx) => pasted[idx] ?? "");
                    onCodeBulkFill(filledDigits);

                    const focusIndex = Math.min(pasted.length, 6) - 1;
                    if (focusIndex >= 0) {
                      codeInputRefs.current[focusIndex]?.focus();
                    }
                  }}
                  className="h-16 w-full rounded-2xl border border-[#4a4842] bg-[#2f2e2c] text-center text-2xl font-semibold text-[#f1efe8] outline-none transition focus:border-[#2f6fc9]"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  aria-label={`Verification digit ${boxIndex + 1}`}
                />
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onResendCode}
                disabled={isSendingPhoneCode}
                className="h-14 rounded-2xl border border-[#57544e] px-8 text-lg font-semibold text-[#f3f2ee] transition hover:border-[#6a6660] hover:bg-[#31302d] disabled:cursor-not-allowed disabled:border-[#4a4842] disabled:text-[#8e8a83]"
              >
                {isSendingPhoneCode ? "Resending..." : "Resend code"}
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onChangeNumber}
                className="h-14 rounded-2xl border border-[#57544e] px-8 text-lg font-semibold text-[#f3f2ee] transition hover:border-[#6a6660] hover:bg-[#31302d]"
              >
                <span className="mr-2">←</span>
                Change number
              </button>

              <button
                type="button"
                onClick={onVerifyCode}
                disabled={isVerifyDisabled}
                className="h-14 flex-1 rounded-2xl border border-[#57544e] px-8 text-2xl font-semibold text-[#f3f2ee] transition hover:border-[#6a6660] hover:bg-[#31302d] disabled:cursor-not-allowed disabled:border-[#4a4842] disabled:text-[#8e8a83] disabled:hover:bg-transparent"
              >
                {isVerifyingPhoneCode ? "Verifying..." : "Verify"}
              </button>
            </div>

            {phoneCodeError ? <p className="text-sm text-[#ff9b93]">{phoneCodeError}</p> : null}
            {sendMessage ? <p className="text-sm text-[var(--sportlink-green)]">{sendMessage}</p> : null}
          </>
        )}
      </div>
    </div>
  );
}
