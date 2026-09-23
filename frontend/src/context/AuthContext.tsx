import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from "../api/authApi";
import { tokenStorage } from "../api/axiosClient";
import type { CurrentUser, LoginRequest } from "../types/auth";

interface AuthContextValue {
    user: CurrentUser | null;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode}){
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const boostrap = async () => {
            if (tokenStorage.getAccessToken()) {
                try{
                    setUser(await getCurrentUser());
                } catch {
                    tokenStorage.clearTokens();
                }
            }
            setIsLoading(false);
        };
        boostrap();
    }, []);

    const login = async (data: LoginRequest) => {
        await loginRequest(data);
        setUser(await getCurrentUser());
    }

    const logout = () => {
        logoutRequest();
        setUser(null);
    }

    const hasRole = (role: string) => user?.roles.includes(role) ?? false;

    return (
        <AuthContext.Provider value={{user, isLoading, login, logout, hasRole}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth nust be used with as AuthProvider');
    return ctx;
}