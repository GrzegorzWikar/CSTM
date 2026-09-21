import {
type PropsWithChildren,
useCallback,
useEffect,
useMemo,
useState,
} from 'react';
import {
getCurrentUserInfo,
login as loginRequest,
logout as logoutRequest,
register as registerRequest,
} from '../api/authApi';
import { UNAUTHORIZED_EVENT_NAME } from '../api/apiClient';
import type {
LoginRequest,
RegisterRequest,
User,
} from '../types';
import {
clearAuthTokens,
getAccessToken,
saveAuthTokens,
} from '../utils/authStorage';
import { getRoleFromAccessToken } from '../utils/jwt';
import {
AuthContext,
type AuthContextValue,
} from './authContextDefinition';

export function AuthProvider({children}: PropsWithChildren){
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const clearSession = useCallback(() => {
        clearAuthTokens();
        setUser(null);
    },[]);

    const loadUserFromStoredToken = useCallback(
        async (): Promise<void> => {
            const accesToken = getAccessToken();

            if (!accesToken) {
                setUser(null);
                return;
            }

            const role = getRoleFromAccessToken(accesToken);

            if (!role){
                clearSession();
                return;
            }

            try{
                const userInfo = await getCurrentUserInfo();

                setUser({
                    email: userInfo.email,
                    role,
                    isEmailConfirmed: userInfo.isEmailConfirmed,
                });
            }catch{
                clearSession();
            }
        },
        [clearSession]
    );

    useEffect(() => {
        async function initializeAuthentication(): Promise<void> {
            try{
                await loadUserFromStoredToken();
            }finally{
                setIsInitializing(false);
            }
        }

        void initializeAuthentication();
    }, [loadUserFromStoredToken]);

    useEffect(() => {
        function handleUnauthorized(): void{
            clearSession();
        }

        function handleLogout(): void{
            clearSession();
        }

        window.addEventListener(
            UNAUTHORIZED_EVENT_NAME,
            handleUnauthorized,
        );

        window.addEventListener(
            'auth:logout',
            handleLogout,
        );

        return () => {
            window.removeEventListener(
                UNAUTHORIZED_EVENT_NAME,
                handleUnauthorized,
            );

            window.removeEventListener(
                'auth:logout',
                handleLogout,
            );
        };
    }, [clearSession]);

    const login = useCallback(
        async (request: LoginRequest): Promise<void> => {
            const response = await loginRequest(request);
            const role = getRoleFromAccessToken(
                response.accessToken,
            );

            if (!role){
                clearSession();

                throw new Error('The access token does not contain a supported role.');
            }

            saveAuthTokens(response);

            try{
                const userInfo = await getCurrentUserInfo();

                setUser({
                    email: userInfo.email,
                    role,
                    isEmailConfirmed: userInfo.isEmailConfirmed,
                });
            } catch (error: unknown) {
                clearSession();
                throw error;
            }
        },
        [clearSession]
    );

    const register = useCallback(
        async (request: RegisterRequest): Promise<void> => {
            await registerRequest(request);
        },
        []
    );

    const logout = useCallback(() => {
        logoutRequest();
        setUser(null);
    }, []);

    const contextValue = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: user !== null,
            isInitializing,
            login,
            register,
            logout,
        }),
        [
            user,
            isInitializing,
            login,
            register,
            logout
        ],
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}