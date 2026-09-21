const DEFAULT_API_BASE_URL = 'https://localhost:7012';

function removeTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export const apiConfig = {
  baseUrl: removeTrailingSlash(
    import.meta.env.VITE_API_BASE_URL?.trim() ||
      DEFAULT_API_BASE_URL,
  ),
  timeoutMilliseconds: 10_000,
} as const;