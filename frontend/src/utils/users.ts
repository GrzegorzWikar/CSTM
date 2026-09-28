import type { UserSummary } from "../types/user";

export function resolveUserEmail(users: UserSummary[] | null, userId: string): string {
    return users?.find((u) => u.id === userId)?.email ?? userId;
}