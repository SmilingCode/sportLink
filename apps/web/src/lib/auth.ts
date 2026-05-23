import type { UserDTO } from "@sportlink/types";

const AUTH_USER_KEY = "sportlink.auth.user";

export interface StoredSession {
  user: UserDTO;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function setStoredSession(session: StoredSession) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
  window.dispatchEvent(new Event("sportlink-auth-changed"));
}

export function clearStoredSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event("sportlink-auth-changed"));
}

export function getStoredSession(): StoredSession | null {
  if (!isBrowser()) {
    return null;
  }

  const rawUser = window.localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser) as UserDTO;
    return { user };
  } catch {
    clearStoredSession();
    return null;
  }
}
