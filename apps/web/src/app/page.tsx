import { Suspense } from "react";
import GamesList from "@/components/GamesList";
import FilterBar from "@/components/FilterBar";

export const metadata = { title: "SportLink — Find games near you" };

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-5 sm:px-8">
      <section className="rounded-[18px] border border-transparent bg-transparent">
        <Suspense fallback={<div className="mb-5 text-sm text-[var(--sportlink-text-soft)]">Loading filters...</div>}>
          <FilterBar />
        </Suspense>
        <Suspense fallback={<GamesSkeleton />}>
          <GamesList />
        </Suspense>
      </section>
    </main>
  );
}

function GamesSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[26rem] animate-pulse rounded-2xl border border-[var(--sportlink-border)] bg-[var(--sportlink-panel)]"
        />
      ))}
    </div>
  );
}
