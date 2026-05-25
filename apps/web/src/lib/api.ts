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

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: "include" });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(error.message ?? "API error", res.status);
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

  me: () => request<UserDTO>("/auth/me"),

  logout: () => request<{ loggedOut: boolean }>("/auth/logout", { method: "POST" }),
  resendVerification: () =>
    request<{ sent: boolean }>("/auth/resend-verification", { method: "POST" }),
};

// ─── Verify ───────────────────────────────────────────────────────────────────

export const verifyApi = {
  createSession: (token?: string) =>
    request<{ clientSecret: string }>("/verify/session", { method: "POST" }, token),
  getIdStatus: (token?: string) =>
    request<{
      status: "not_started" | "under_review" | "review_failed" | "verified" | "canceled";
      detail: string;
    }>("/verify/id-status", {}, token),
  sendPhoneCode: (phone: string, token?: string) =>
    request<{ sent: boolean; maskedPhone?: string }>(
      "/verify/phone/send",
      {
        method: "POST",
        body: JSON.stringify({ phone }),
      },
      token,
    ),
  checkPhoneCode: (phone: string, code: string, token?: string) =>
    request<{ verified: boolean }>(
      "/verify/phone/check",
      {
        method: "POST",
        body: JSON.stringify({ phone, code }),
      },
      token,
    ),
};
