"use client";

interface AboutSectionProps {
  description?: string;
}

export default function AboutSection({ description }: AboutSectionProps) {
  return (
    <div className="rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] p-6">
      <p className="mb-4 text-xs font-semibold uppercase text-[var(--sportlink-text-muted)]">
        About this game
      </p>
      <p className="text-sm leading-relaxed text-[#e8e6de]">
        {description ||
          "No description provided for this game. Contact the host for more information."}
      </p>
    </div>
  );
}
