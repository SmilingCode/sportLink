"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserDTO } from "@sportlink/types";
import { clearStoredSession, getStoredSession, setStoredSession } from "@/lib/auth";
import { ApiError, authApi } from "@/lib/api";
import ProfileHeaderCard from "./components/ProfileHeaderCard";
import VerificationSection from "./components/VerificationSection";
import {
  buildVerificationSteps,
  getInitials,
  getVerificationState,
  verificationSummary,
} from "./helpers";
import { useProfileVerification } from "./hooks/useProfileVerification";

export default function ProfilePage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<UserDTO | null>(null);

  const handleUnauthorized = useCallback(() => {
    clearStoredSession();
    router.replace("/auth/login?next=%2Fprofile");
  }, [router]);

  const verification = useProfileVerification({
    setUser,
    onUnauthorized: handleUnauthorized,
  });

  useEffect(() => {
    const session = getStoredSession();

    if (session) {
      setUser(session.user);
      setAuthChecked(true);
    }

    async function syncCurrentUser() {
      try {
        const freshUser = await authApi.me();
        setUser(freshUser);
        setStoredSession({ user: freshUser });
      } catch (error) {
        if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)) {
          handleUnauthorized();
        }
      } finally {
        setAuthChecked(true);
      }
    }

    void syncCurrentUser();
  }, [handleUnauthorized]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.verificationStatus === "id_verified" || user.verificationStatus === "fully_verified") {
      return;
    }

    void verification.loadIdVerificationStatus();
  }, [user?.verificationStatus]);

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
  const verificationSteps = buildVerificationSteps(
    verificationState,
    user.email,
    verification.idVerificationDetail ?? undefined,
  );
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
        <ProfileHeaderCard
          initials={getInitials(user.name)}
          name={user.name}
          locationLabel={locationLabel}
          joinedMonth={joinedMonth}
          gamesJoined={user.gamesJoined ?? 0}
          gamesHosted={user.gamesHosted ?? 0}
          verificationSummary={verificationSummary(user.verificationStatus)}
        />

        <VerificationSection
          verificationSteps={verificationSteps}
          expandedSteps={verification.expandedSteps}
          isResendingEmail={verification.isResendingEmail}
          resendMessage={verification.resendMessage}
          phoneCardOpen={verification.phoneCardOpen}
          phoneInput={verification.phoneInput}
          phoneInputError={verification.phoneInputError}
          maskedPhoneLabel={verification.maskedPhoneLabel}
          isSendDisabled={!verification.isPhoneInputValid || verification.isSendingPhoneCode}
          isVerifyDisabled={verification.isVerifyDisabled}
          phoneCodeSent={verification.phoneCodeSent}
          phoneCodeDigits={verification.phoneCodeDigits}
          phoneCodeError={verification.phoneCodeError}
          isSendingPhoneCode={verification.isSendingPhoneCode}
          isVerifyingPhoneCode={verification.isVerifyingPhoneCode}
          phoneSendMessage={verification.phoneSendMessage}
          isStartingIdVerification={verification.isStartingIdVerification}
          idVerificationError={verification.idVerificationError}
          onResendEmail={verification.handleResendEmail}
          onBackToEmailInstructions={() => verification.setResendMessage(null)}
          onToggleStep={(stepId) =>
            verification.setExpandedSteps((current) => ({
              ...current,
              [stepId]: !(current[stepId] ?? true),
            }))
          }
          onStartPhoneVerification={verification.handleStartPhoneVerification}
          onPhoneInputChange={verification.handlePhoneInputChange}
          onPhoneInputBlur={verification.handlePhoneInputBlur}
          onCodeDigitChange={verification.handleCodeDigitChange}
          onCodeBulkFill={verification.handleCodeBulkFill}
          onChangePhoneNumber={verification.handleChangeNumber}
          onSendPhoneCode={() => void verification.handleSendPhoneCode()}
          onResendPhoneCode={() => void verification.handleSendPhoneCode({ isResend: true })}
          onVerifyPhoneCode={() => void verification.handleVerifyPhoneCode()}
          onStartIdVerification={() => void verification.handleStartIdVerification()}
        />
      </section>
    </main>
  );
}
