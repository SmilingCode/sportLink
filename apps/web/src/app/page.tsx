import { Suspense } from "react";
import GamesList from "@/components/GamesList";
import FilterBar from "@/components/FilterBar";

export const metadata = { title: "SportLink — Find games near you" };

export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium mb-1">Games near you</h1>
      <p className="text-gray-500 text-sm mb-6">
        Join verified pickup games in your area
      </p>
      <Suspense fallback={<div className="text-gray-400 text-sm">Loading filters...</div>}>
        <FilterBar />
      </Suspense>
      <Suspense fallback={<GamesSkeleton />}>
        <GamesList />
      </Suspense>
    </main>
  );
}

function GamesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-52 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}
