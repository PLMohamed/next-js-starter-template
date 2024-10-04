export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    confirmPassword: string;
    name?: string;
}