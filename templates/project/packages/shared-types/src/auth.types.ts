export interface LoginRequest { email: string; password: string; deviceId?: string; }
export interface LoginResponse { accessToken: string; refreshToken: string; deviceId: string; user: UserInfo; }
export interface UserInfo { id: string; email: string; displayName: string; avatar?: string; }
export interface TokenPayload { sub: string; email: string; iat: number; exp: number; }
