import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { UserDTO } from "@sportlink/types";
import { ApiError, authApi, verifyApi } from "@/lib/api";
import { setStoredSession } from "@/lib/auth";
import { getStripeIdentityClient } from "@/lib/stripe";
import { maskAuMobileForDisplay, validateAuMobile } from "@/lib/verification";

type UseProfileVerificationParams = {
  setUser: Dispatch<SetStateAction<UserDTO | null>>;
  onUnauthorized: () => void;
};

export function useProfileVerification({
  setUser,
  onUnauthorized,
}: UseProfileVerificationParams) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({ email: true });
  const [phoneCardOpen, setPhoneCardOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneInputTouched, setPhoneInputTouched] = useState(false);
  const [phoneInputError, setPhoneInputError] = useState<string | null>(null);
  const [phoneSendMessage, setPhoneSendMessage] = useState<string | null>(null);
  const [maskedPhoneLabel, setMaskedPhoneLabel] = useState<string>("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneCodeDigits, setPhoneCodeDigits] = useState<string[]>(Array(6).fill(""));
  const [phoneCodeError, setPhoneCodeError] = useState<string | null>(null);
  const [isSendingPhoneCode, setIsSendingPhoneCode] = useState(false);
  const [isVerifyingPhoneCode, setIsVerifyingPhoneCode] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isStartingIdVerification, setIsStartingIdVerification] = useState(false);
  const [idVerificationError, setIdVerificationError] = useState<string | null>(null);
  const [idVerificationDetail, setIdVerificationDetail] = useState<string | null>(null);
  const [idVerificationStatus, setIdVerificationStatus] = useState<
    "not_started" | "under_review" | "review_failed" | "verified" | "canceled" | null
  >(null);

  const loadIdVerificationStatus = async () => {
    try {
      const result = await verifyApi.getIdStatus();
      setIdVerificationDetail(result.detail);
      setIdVerificationStatus(result.status);
    } catch (error) {
      if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)) {
        onUnauthorized();
      }
    }
  };

  const handleResendEmail = async () => {
    setResendMessage(null);

    setIsResendingEmail(true);
    try {
      await authApi.resendVerification();
      setResendMessage("Confirmation email sent again. Check your inbox and spam folder.");
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        onUnauthorized();
        return;
      }

      if (
        error instanceof ApiError &&
        error.statusCode === 400 &&
        error.message.includes("Email is already verified")
      ) {
        setUser((current) =>
          current
            ? {
                ...current,
                verificationStatus: "email_verified",
              }
            : current,
        );
        setExpandedSteps((current) => ({ ...current, email: false }));
        setResendMessage("Email is already verified.");
        return;
      }

      const message =
        error instanceof Error ? error.message : "Could not resend confirmation email.";
      setResendMessage(message);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleStartPhoneVerification = () => {
    setPhoneCardOpen(true);
    setPhoneInputTouched(false);
    setPhoneInputError(null);
    setPhoneSendMessage(null);
    setMaskedPhoneLabel("");
    setPhoneCodeSent(false);
    setPhoneCodeDigits(Array(6).fill(""));
    setPhoneCodeError(null);
  };

  const handlePhoneInputChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 11);
    setPhoneInput(digitsOnly);
    setPhoneCodeSent(false);
    setPhoneSendMessage(null);
    setPhoneCodeDigits(Array(6).fill(""));
    setPhoneCodeError(null);

    if (phoneInputTouched) {
      setPhoneInputError(validateAuMobile(digitsOnly));
    }
  };

  const handlePhoneInputBlur = () => {
    setPhoneInputTouched(true);
    setPhoneInputError(validateAuMobile(phoneInput));
  };

  const handleSendPhoneCode = async ({ isResend = false }: { isResend?: boolean } = {}) => {
    setPhoneInputTouched(true);
    const validationError = validateAuMobile(phoneInput);

    if (validationError) {
      setPhoneInputError(validationError);
      setPhoneCodeSent(false);
      setPhoneSendMessage(null);
      return;
    }

    setPhoneInputError(null);
    setPhoneCodeError(null);
    setPhoneSendMessage(null);
    setIsSendingPhoneCode(true);

    try {
      const response = await verifyApi.sendPhoneCode(phoneInput);
      setPhoneCodeSent(true);
      setMaskedPhoneLabel(response.maskedPhone ?? maskAuMobileForDisplay(phoneInput));
      if (!isResend) {
        setPhoneCodeDigits(Array(6).fill(""));
      }
      setPhoneSendMessage(isResend ? "A new code has been sent." : null);
    } catch (error) {
      if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)) {
        onUnauthorized();
        return;
      }

      const message = error instanceof Error ? error.message : "Could not send SMS code.";
      if (phoneCodeSent || isResend) {
        setPhoneCodeError(message);
      } else {
        setPhoneSendMessage(message);
      }
    } finally {
      setIsSendingPhoneCode(false);
    }
  };

  const handleCodeDigitChange = (index: number, value: string) => {
    setPhoneCodeError(null);
    setPhoneSendMessage(null);
    setPhoneCodeDigits((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  };

  const handleCodeBulkFill = (digits: string[]) => {
    setPhoneCodeError(null);
    setPhoneSendMessage(null);
    setPhoneCodeDigits(digits);
  };

  const handleChangeNumber = () => {
    setPhoneCodeSent(false);
    setPhoneCodeDigits(Array(6).fill(""));
    setPhoneCodeError(null);
    setPhoneSendMessage(null);
  };

  const handleVerifyPhoneCode = async () => {
    const code = phoneCodeDigits.join("");
    if (code.length !== 6) {
      setPhoneCodeError("Enter all 6 digits before verifying.");
      return;
    }

    setIsVerifyingPhoneCode(true);
    setPhoneCodeError(null);
    setPhoneSendMessage(null);

    try {
      await verifyApi.checkPhoneCode(phoneInput, code);
      const freshUser = await authApi.me();
      setUser(freshUser);
      setStoredSession({ user: freshUser });
      setPhoneCardOpen(false);
    } catch (error) {
      if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)) {
        onUnauthorized();
        return;
      }

      const message = error instanceof Error ? error.message : "Could not verify SMS code.";
      setPhoneCodeError(message);
    } finally {
      setIsVerifyingPhoneCode(false);
    }
  };

  const handleStartIdVerification = async () => {
    setIdVerificationError(null);
    setIsStartingIdVerification(true);

    try {
      const { clientSecret } = await verifyApi.createSession();
      const stripeIdentity = await getStripeIdentityClient();
      const result = await stripeIdentity.verifyIdentity(clientSecret);

      if (result.error) {
        setIdVerificationError(result.error.message ?? "ID verification was cancelled or failed.");
        await loadIdVerificationStatus();
        return;
      }

      const freshUser = await authApi.me();
      setUser(freshUser);
      setStoredSession({ user: freshUser });
      await loadIdVerificationStatus();
    } catch (error) {
      if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)) {
        onUnauthorized();
        return;
      }

      if (
        error instanceof Error &&
        (error.message.includes("Stripe") || error.message.includes("stripe"))
      ) {
        setIdVerificationError("Stripe Identity is unavailable right now. Please try again.");
      } else if (error instanceof Error) {
        setIdVerificationError(error.message);
      } else {
        setIdVerificationError("Could not start ID verification. Please try again.");
      }
    } finally {
      setIsStartingIdVerification(false);
    }
  };

  const isPhoneInputValid = validateAuMobile(phoneInput) === null;
  const isVerifyDisabled = phoneCodeDigits.some((digit) => digit === "") || isVerifyingPhoneCode;

  return {
    expandedSteps,
    isResendingEmail,
    resendMessage,
    phoneCardOpen,
    phoneInput,
    phoneInputError,
    maskedPhoneLabel,
    isPhoneInputValid,
    isVerifyDisabled,
    phoneCodeSent,
    phoneCodeDigits,
    phoneCodeError,
    isSendingPhoneCode,
    isVerifyingPhoneCode,
    isStartingIdVerification,
    phoneSendMessage,
    idVerificationError,
    idVerificationDetail,
    idVerificationStatus,
    setExpandedSteps,
    setResendMessage,
    handleResendEmail,
    handleStartPhoneVerification,
    handlePhoneInputChange,
    handlePhoneInputBlur,
    handleCodeDigitChange,
    handleCodeBulkFill,
    handleChangeNumber,
    handleSendPhoneCode,
    handleVerifyPhoneCode,
    handleStartIdVerification,
    loadIdVerificationStatus,
  };
}
