import { type JWTPayload } from "jose";

export interface UserTokenPayload extends JWTPayload {
    id: string;
    role: string;
    type: string;
}
