type ProfileHeaderCardProps = {
  initials: string;
  name: string;
  locationLabel: string;
  joinedMonth: string;
  gamesJoined: number;
  gamesHosted: number;
  verificationSummary: string;
};

export default function ProfileHeaderCard({
  initials,
  name,
  locationLabel,
  joinedMonth,
  gamesJoined,
  gamesHosted,
  verificationSummary,
}: ProfileHeaderCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar initials={initials} />
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#f1efe8] sm:text-3xl">
              {name}
            </h1>
            <p className="mt-1 text-sm text-[var(--sportlink-text-soft)]">
              {locationLabel} · Joined {joinedMonth}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:min-w-[22rem]">
          <Stat label="games joined" value={String(gamesJoined)} />
          <Stat label="games hosted" value={String(gamesHosted)} />
          <Stat label="verified" value={verificationSummary} />
        </div>
      </div>
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
