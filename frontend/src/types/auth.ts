export type UserRole = 'User' | 'Support' | 'Admin';

export interface User {
  email: string;
  role: UserRole;
  isEmailConfirmed: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string | null;
  twoFactorRecoveryCode?: string | null;
}

export interface LoginResponse {
  tokenType: string | null;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface UserInfoResponse {
  email: string;
  isEmailConfirmed: boolean;
}

export interface JwtClaims {
  role?: unknown;
  exp?: unknown;
  email?: unknown;
  sub?: unknown;
}