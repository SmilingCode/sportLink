import type {
  GameDTO,
  GameSummaryDTO,
  ListGamesQuery,
  CreateGameBody,
  PaginatedResponse,
  UserDTO,
  LoginResponse,
} from "@sportlink/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: "include" });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? "API error");
  }

  return res.json() as Promise<T>;
}

// ─── Games ────────────────────────────────────────────────────────────────────

export const gamesApi = {
  list: (query: ListGamesQuery) => {
    const params = new URLSearchParams(
      Object.entries(query)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    );
    return request<PaginatedResponse<GameSummaryDTO>>(`/games?${params}`);
  },

  get: (id: string) => request<GameDTO>(`/games/${id}`),

  create: (body: CreateGameBody, token?: string) =>
    request<GameDTO>("/games", { method: "POST", body: JSON.stringify(body) }, token),

  join: (id: string, token?: string) =>
    request<{ joined: boolean }>(`/games/${id}/join`, { method: "POST" }, token),

  leave: (id: string, token?: string) =>
    request<{ left: boolean }>(`/games/${id}/leave`, { method: "DELETE" }, token),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  signup: (name: string, email: string, password: string) =>
    request<LoginResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (token: string) =>
    request<{ verified: boolean }>(
      `/auth/verify-email?${new URLSearchParams({ token }).toString()}`,
    ),

  me: (token?: string) => request<UserDTO>("/auth/me", {}, token),

  logout: () => request<{ loggedOut: boolean }>("/auth/logout", { method: "POST" }),
};

// ─── Verify ───────────────────────────────────────────────────────────────────

export const verifyApi = {
  createSession: (token?: string) =>
    request<{ clientSecret: string }>("/verify/session", { method: "POST" }, token),
};
