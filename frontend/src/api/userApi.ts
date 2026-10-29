import axiosClient from "./axiosClient";
import type { UserSummary } from "../types/user";

export const getUsers = async (): Promise<UserSummary[]> => {
    const response = await axiosClient.get<UserSummary[]>('/api/account/users');
    return response.data;
}

export const assignRole = async (userId: string, role: string): Promise<void> => {
    await axiosClient.post('api/account/assign-role', {userId, role});
}