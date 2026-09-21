import type {
  JwtClaims,
  UserRole,
} from '../types';

const supportedRoles: UserRole[] = [
  'User',
  'Support',
  'Admin',
];

function decodeBase64Url(value: string): string {
  const base64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const paddingLength = (4 - (base64.length % 4)) % 4;
  const paddedBase64 = base64.padEnd(
    base64.length + paddingLength,
    '=',
  );

  const decodedValue = atob(paddedBase64);

  const bytes = Uint8Array.from(
    decodedValue,
    (character) => character.charCodeAt(0),
  );

  return new TextDecoder().decode(bytes);
}

export function decodeJwtClaims(
  accessToken: string,
): JwtClaims | null {
  const tokenParts = accessToken.split('.');

  if (tokenParts.length !== 3) {
    return null;
  }

  const payload = tokenParts[1];

  if (!payload) {
    return null;
  }

  try {
    const decodedPayload = decodeBase64Url(payload);
    const parsedPayload: unknown = JSON.parse(decodedPayload);

    if (
      typeof parsedPayload !== 'object' ||
      parsedPayload === null
    ) {
      return null;
    }

    return parsedPayload as JwtClaims;
  } catch {
    return null;
  }
}

export function getRoleFromAccessToken(
  accessToken: string,
): UserRole | null {
  const claims = decodeJwtClaims(accessToken);

  if (!claims || typeof claims.role !== 'string') {
    return null;
  }

  return supportedRoles.includes(claims.role as UserRole)
    ? (claims.role as UserRole)
    : null;
}