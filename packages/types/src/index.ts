// ─── Enums ────────────────────────────────────────────────────────────────────

export type Sport = "soccer" | "basketball" | "volleyball" | "spikeball";

export type SkillLevel = "beginner" | "intermediate" | "competitive";

export type Gender = "open" | "men" | "women" | "mixed";

export type RecurringType = "one_off" | "weekly" | "fortnightly";

export type VerificationStatus =
  | "unverified"
  | "email_verified"
  | "phone_verified"
  | "id_verified"
  | "fully_verified";

export type GameStatus = "open" | "full" | "cancelled" | "completed";

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  location?: {
    lat: number;
    lng: number;
    suburb?: string;
  };
  verificationStatus: VerificationStatus;
  gamesJoined: number;
  gamesHosted: number;
  createdAt: string; // ISO 8601
}

export interface UserPublicDTO {
  id: string;
  name: string;
  avatarUrl?: string;
  verificationStatus: VerificationStatus;
}

// ─── Game ─────────────────────────────────────────────────────────────────────

export interface GameDTO {
  id: string;
  title: string;
  sport: Sport;
  skillLevel: SkillLevel;
  gender: Gender;
  dateTime: string; // ISO 8601
  recurring: RecurringType;
  location: {
    lat: number;
    lng: number;
    address: string;
    suburb: string;
  };
  distanceKm?: number; // populated server-side when querying by location
  minPlayers: number;
  maxPlayers: number;
  currentPlayers: number;
  costPerPlayer: number; // 0 = free, in AUD cents
  equipmentNotes?: string;
  description?: string;
  status: GameStatus;
  host: UserPublicDTO;
  createdAt: string;
}

export interface GameSummaryDTO extends Pick<
  GameDTO,
  | "id"
  | "title"
  | "sport"
  | "skillLevel"
  | "gender"
  | "dateTime"
  | "location"
  | "distanceKm"
  | "minPlayers"
  | "maxPlayers"
  | "currentPlayers"
  | "costPerPlayer"
  | "status"
  | "host"
> {}

// ─── API request bodies ───────────────────────────────────────────────────────

export interface CreateGameBody {
  title: string;
  sport: Sport;
  skillLevel: SkillLevel;
  gender: Gender;
  dateTime: string;
  recurring: RecurringType;
  location: {
    lat: number;
    lng: number;
    address: string;
    suburb: string;
  };
  minPlayers: number;
  maxPlayers: number;
  costPerPlayer: number;
  equipmentNotes?: string;
  description?: string;
}

export interface ListGamesQuery {
  lat: number;
  lng: number;
  radiusKm: 10 | 20 | 60;
  sport?: Sport;
  skillLevel?: SkillLevel;
  gender?: Gender;
  page?: number;
  limit?: number;
}

// ─── API response wrappers ───────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokenPayload {
  sub: string; // user id
  email: string;
  verificationStatus: VerificationStatus;
  iat: number;
  exp: number;
}

export interface LoginResponse {
  user: UserDTO;
}
