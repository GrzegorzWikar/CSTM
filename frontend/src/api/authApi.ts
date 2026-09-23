import axiosClient, { tokenStorage } from "./axiosClient";
import type { AccessTokenRsponse, CurrentUser, LoginRequest, RegisterRequest } from "../types/auth";

export const login = async (data: LoginRequest): Promise<AccessTokenRsponse> => {
    const response = await axiosClient.post<AccessTokenRsponse>('/login', data);
    tokenStorage.setTokens(response.data);
    return response.data;
}

export const register = (data: RegisterRequest): Promise<void> => {
    return axiosClient.post(`/api/account/register`, data);
}

export const logout = (): void => {
    tokenStorage.clearTokens();
}

export const getCurrentUser = async (): Promise<CurrentUser> => {
    const response = await axiosClient.get<CurrentUser>('/api/account/me');
    return response.data;
}