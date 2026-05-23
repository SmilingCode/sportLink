"use client";

import { UserPublicDTO } from "@sportlink/types";

interface HostAndAboutProps {
  host: UserPublicDTO;
  description?: string;
}

const verificationBadges: Record<string, string> = {
  unverified: "Unverified",
  email_verified: "Email verified",
  phone_verified: "Phone verified",
  id_verified: "ID verified",
  fully_verified: "Verified",
};

export default function HostAndAbout({ host, description }: HostAndAboutProps) {
  return (
    <div className="rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] p-6">
      {/* Hosted By */}
      <div className="mb-6 pb-6 border-b border-[var(--sportlink-border)]">
        <p className="mb-4 text-xs font-semibold uppercase text-[var(--sportlink-text-muted)]">
          Hosted by
        </p>
        <div className="flex items-center gap-4">
          <img
            src={host.avatarUrl || `https://i.pravatar.cc/48?u=${host.id}`}
            alt={host.name}
            className="h-12 w-12 rounded-full"
          />
          <div className="flex-1">
            <h3 className="font-medium text-[#f3f2ee]">{host.name}</h3>
            <p className="text-sm text-[var(--sportlink-text-soft)]">
              {verificationBadges[host.verificationStatus]}
            </p>
          </div>
        </div>
      </div>

      {/* About This Game */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase text-[var(--sportlink-text-muted)]">
          About this game
        </p>
        <p className="text-sm leading-relaxed text-[#e8e6de]">
          {description ||
            "No description provided for this game. Contact the host for more information."}
        </p>
      </div>
    </div>
  );
}
