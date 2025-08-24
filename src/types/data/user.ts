import { type JWTPayload } from "jose";

export interface UserTokenPayload extends JWTPayload {
  uuid: string;
  role: string;
  type: string;
}
