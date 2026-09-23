import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AccessTokenRsponse } from "../types/auth";

const axiosClient = axios.create({baseURL: import.meta.env.VITE_API_BASE_URL, headers: {'Content-Type': 'application/json'}});

const ACCESS_TOKEN_KEY = 'cstm_access_token';
const REFRESH_TOKEN_KEY = 'cstm_refresh_token';

export const tokenStorage = {
    getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
    getRefreshToke: () => localStorage.getItem(REFRESH_TOKEN_KEY),
    setTokens: (tokens: AccessTokenRsponse) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    },
    clearTokens: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
};

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
});

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const orginalRequest = error.config as
        | (InternalAxiosRequestConfig & {_retry?: boolean})
        | undefined;

        const isRefreshCall = orginalRequest?.url?.includes('/refresh');

        if ( error.response?.status !== 401 || !orginalRequest || orginalRequest._retry || isRefreshCall){
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve) => {
                pendingQueue.push(() => resolve(axiosClient(orginalRequest)));
            });
        }

        orginalRequest._retry = true;
        isRefreshing = true;

        try{
            const refreshToken = tokenStorage.getRefreshToke();
            if(!refreshToken) throw new Error('No refresh token');

            const { data } = await axios.post<AccessTokenRsponse>(`${import.meta.env.VITE_API_BASE_URL}/refresh`, {refreshToken});

            tokenStorage.setTokens(data);
            pendingQueue.forEach((resolvePending) => resolvePending());
            pendingQueue = [];

            return axiosClient(orginalRequest);
        }catch (refreshError) {
            tokenStorage.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
        }finally{
            isRefreshing = false;
        }
    }
);

export default axiosClient;