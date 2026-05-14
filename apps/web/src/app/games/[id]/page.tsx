"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GameDTO, UserPublicDTO } from "@sportlink/types";
import GameInfo from "@/components/GameInfo";
import HostAndAbout from "@/components/HostAndAbout";
import PlayersList from "@/components/PlayersList";
import LocationCard from "@/components/LocationCard";
import { gamesApi } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";

// Mock game data for development
const MOCK_GAME: GameDTO = {
  id: "game-1",
  title: "Sunday morning kickabout",
  sport: "soccer",
  skillLevel: "intermediate",
  gender: "mixed",
  dateTime: "2026-05-11T09:00:00Z",
  recurring: "weekly",
  location: {
    lat: -33.8688,
    lng: 151.2093,
    address: "New South Head Rd, Rushcutters Bay NSW",
    suburb: "Rushcutters Bay Park",
  },
  distanceKm: 3.2,
  minPlayers: 2,
  maxPlayers: 18,
  currentPlayers: 7,
  costPerPlayer: 0,
  equipmentNotes: "Ball provided",
  description:
    "Casual Sunday kickabout at Rushcutters Bay. All welcome — bring boots and water. We split into two teams on arrival. Numbers permitting we play 9v9.",
  status: "open",
  host: {
    id: "user-1",
    name: "Jordan Smith",
    avatarUrl: "https://i.pravatar.cc/48?img=1",
    verificationStatus: "fully_verified",
  },
  createdAt: "2026-05-01T10:00:00Z",
};

const MOCK_PLAYERS: UserPublicDTO[] = [
  {
    id: "user-1",
    name: "Jordan Smith",
    avatarUrl: "https://i.pravatar.cc/48?img=1",
    verificationStatus: "fully_verified",
  },
  {
    id: "user-2",
    name: "Alex Marchetti",
    avatarUrl: "https://i.pravatar.cc/48?img=2",
    verificationStatus: "fully_verified",
  },
  {
    id: "user-3",
    name: "Priya Khan",
    avatarUrl: "https://i.pravatar.cc/48?img=3",
    verificationStatus: "fully_verified",
  },
  {
    id: "user-4",
    name: "Ryan Lee",
    avatarUrl: "https://i.pravatar.cc/48?img=4",
    verificationStatus: "fully_verified",
  },
  {
    id: "user-5",
    name: "Mia Thompson",
    avatarUrl: "https://i.pravatar.cc/48?img=5",
    verificationStatus: "fully_verified",
  },
  {
    id: "user-6",
    name: "Sam Wilson",
    avatarUrl: "https://i.pravatar.cc/48?img=6",
    verificationStatus: "fully_verified",
  },
  {
    id: "user-7",
    name: "Ella Martin",
    avatarUrl: "https://i.pravatar.cc/48?img=7",
    verificationStatus: "fully_verified",
  },
];

interface PageProps {
  params: { id: string };
}

export default function GameDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [game, setGame] = useState<GameDTO | null>(null);
  const [players, setPlayers] = useState<UserPublicDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const token = getStoredToken();

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch from API
        const result = await gamesApi.get(params.id);
        setGame(result);
        // In a real app, we'd also fetch the players list
        setPlayers(
          MOCK_PLAYERS.slice(0, Math.min(result.currentPlayers, MOCK_PLAYERS.length)),
        );
      } catch {
        // Fallback to mock data
        setGame(MOCK_GAME);
        setPlayers(MOCK_PLAYERS);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [params.id]);

  const handleJoinGame = async () => {
    if (!token) {
      router.push(`/auth/login?next=%2Fgames%2F${params.id}`);
      return;
    }

    setIsJoining(true);
    try {
      // In a real app, call the API to join
      // await gamesApi.join(params.id, token);
      console.log("User joined game:", params.id);
      // TODO: Show confirmation, refetch game data, etc.
    } catch (err) {
      console.error("Failed to join game:", err);
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1c1b19]">
        <div className="text-[var(--sportlink-text-muted)]">Loading game...</div>
      </div>
    );
  }

  if (!game || error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#1c1b19]">
        <div className="text-[#ff8f87] mb-4">Failed to load game</div>
        <Link
          href="/games"
          className="text-[var(--sportlink-green)] hover:underline"
        >
          Back to games
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1b19]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Back to games */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm text-[var(--sportlink-text-muted)] hover:text-[#f3f2ee] transition"
        >
          ← Back to games
        </Link>

        <div className="grid grid-cols-5 gap-6">
          {/* Left column (3/5) */}
          <div className="col-span-3 space-y-6">
            <GameInfo
              game={game}
              onJoinClick={handleJoinGame}
              isJoining={isJoining}
              isFull={game.status === "full"}
            />

            <HostAndAbout host={game.host} description={game.description} />
            <PlayersList players={players} total={game.currentPlayers} />
          </div>

          {/* Right column (2/5) */}
          <div className="col-span-2">
            <LocationCard game={game} />
          </div>
        </div>
      </div>
    </div>
  );
}
