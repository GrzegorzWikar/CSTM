import type { LoginResponse } from '../types';

const ACCESS_TOKEN_STORAGE_KEY = 'cstm-access-token';
const REFRESH_TOKEN_STORAGE_KEY = 'cstm-refresh-token';
const TOKEN_EXPIRATION_STORAGE_KEY = 'cstm-token-expiration';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function getTokenExpiration(): number | null {
  const storedExpiration = localStorage.getItem(
    TOKEN_EXPIRATION_STORAGE_KEY,
  );

  if (!storedExpiration) {
    return null;
  }

  const parsedExpiration = Number(storedExpiration);

  return Number.isFinite(parsedExpiration)
    ? parsedExpiration
    : null;
}

export function saveAuthTokens(response: LoginResponse): void {
  const expirationTime =
    Date.now() + response.expiresIn * 1_000;

  localStorage.setItem(
    ACCESS_TOKEN_STORAGE_KEY,
    response.accessToken,
  );

  localStorage.setItem(
    REFRESH_TOKEN_STORAGE_KEY,
    response.refreshToken,
  );

  localStorage.setItem(
    TOKEN_EXPIRATION_STORAGE_KEY,
    expirationTime.toString(),
  );
}

export function clearAuthTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_EXPIRATION_STORAGE_KEY);
}