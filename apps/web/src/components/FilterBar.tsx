"use client";

export default function FilterBar() {
  return (
    <div className="mb-5 space-y-3">
      <input
        type="search"
        placeholder="Search games..."
        className="w-full rounded-xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] px-4 py-3 text-[15px] text-[#f1efe8] outline-none transition placeholder:text-[var(--sportlink-text-muted)] focus:border-[#6f6e67]"
      />

      <div className="relative">
        <select
          defaultValue="Within 10 km"
          className="w-full rounded-xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] px-4 py-3 pr-12 text-[15px] font-semibold text-[#efede5] outline-none transition focus:border-[#6f6e67]"
        >
          <option>Within 10 km</option>
          <option>Within 20 km</option>
          <option>Within 60 km</option>
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--sportlink-text-soft)]">⌄</span>
      </div>

      <div className="relative">
        <select className="w-full rounded-xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] px-4 py-3 pr-12 text-[15px] font-semibold text-[#efede5] outline-none transition focus:border-[#6f6e67]">
        <option>Within 10 km</option>
          <option>All sports</option>
          <option>Soccer</option>
          <option>Basketball</option>
          <option>Volleyball</option>
          <option>Spikeball</option>
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--sportlink-text-soft)]">⌄</span>
      </div>

      <div className="relative">
        <select className="w-full rounded-xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] px-4 py-3 pr-12 text-[15px] font-semibold text-[#efede5] outline-none transition focus:border-[#6f6e67]">
          <option>Any skill level</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Competitive</option>
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--sportlink-text-soft)]">⌄</span>
      </div>

      <div className="relative">
        <select className="w-full rounded-xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)] px-4 py-3 pr-12 text-[15px] font-semibold text-[#efede5] outline-none transition focus:border-[#6f6e67]">
          <option>Any gender</option>
          <option>Open</option>
          <option>Men</option>
          <option>Women</option>
          <option>Mixed</option>
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--sportlink-text-soft)]">⌄</span>
      </div>
    </div>
  );
}
