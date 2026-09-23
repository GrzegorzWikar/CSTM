export interface LoginRequest{
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password:string;
}

export interface AccessTokenRsponse {
    tokenType: string;
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
}

export interface CurrentUser {
    id: string;
    email: string;
    roles: string[];
}