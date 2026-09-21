import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import type {
  LoginResponse,
  RefreshTokenRequest,
} from '../types';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from '../utils/authStorage';
import { apiConfig } from './apiConfig';

export const UNAUTHORIZED_EVENT_NAME = 'auth:unauthorized';

interface RetryRequestConfig
  extends InternalAxiosRequestConfig {
  hasRetriedAfterUnauthorized?: boolean;
}

const apiClient = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeoutMilliseconds,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeoutMilliseconds,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let refreshRequest: Promise<LoginResponse> | null = null;

async function refreshAccessToken(): Promise<LoginResponse> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('Refresh token is not available.');
  }

  if (!refreshRequest) {
    const request: RefreshTokenRequest = {
      refreshToken,
    };

    refreshRequest = refreshClient
      .post<LoginResponse>('/refresh', request)
      .then((response) => {
        saveAuthTokens(response.data);

        return response.data;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

function handleUnauthorized(): void {
  clearAuthTokens();

  window.dispatchEvent(
    new CustomEvent(UNAUTHORIZED_EVENT_NAME),
  );
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization =
      `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryRequestConfig | undefined;

    const responseStatus = error.response?.status;

    if (
      responseStatus !== 401 ||
      !originalRequest ||
      originalRequest.hasRetriedAfterUnauthorized
    ) {
      return Promise.reject(error);
    }

    originalRequest.hasRetriedAfterUnauthorized = true;

    try {
      const refreshedTokens = await refreshAccessToken();

      originalRequest.headers.Authorization =
        `Bearer ${refreshedTokens.accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError: unknown) {
      handleUnauthorized();

      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;