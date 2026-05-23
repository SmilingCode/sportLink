"use client";

import { UserPublicDTO } from "@sportlink/types";

interface HostCardProps {
  host: UserPublicDTO;
}

const verificationBadges: Record<string, string> = {
  unverified: "Unverified",
  email_verified: "Email verified",
  phone_verified: "Phone verified",
  id_verified: "ID verified",
  fully_verified: "Verified",
};

export default function HostCard({ host }: HostCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] p-6">
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
  );
}
