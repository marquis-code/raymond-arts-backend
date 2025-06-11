import type { SocialProvider } from "../dto/social-auth.dto"

export interface JwtPayload {
  sub: string
  email: string
  iat?: number
  exp?: number
}

export interface AuthResult {
  accessToken: string
  refreshToken?: string
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    picture?: string
  }
}

export interface SocialLoginResult extends AuthResult {
  isNewUser: boolean
  provider: SocialProvider
}
