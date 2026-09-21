import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserInfoResponse,
} from '../types';

import apiClient from './apiClient';

export async function login(
  request: LoginRequest,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    '/login',
    request,
    {
      params: {
        useCookies: false,
        useSessionCookies: false,
      },
    },
  );

  return response.data;
}

export async function register(
  request: RegisterRequest,
): Promise<void> {
  await apiClient.post('/register', request);
}

export async function getCurrentUserInfo(): Promise<UserInfoResponse> {
  const response = await apiClient.get<UserInfoResponse>(
    '/manage/info',
  );

  return response.data;
}

export function logout(): void {
  window.dispatchEvent(
    new CustomEvent('auth:logout'),
  );
}