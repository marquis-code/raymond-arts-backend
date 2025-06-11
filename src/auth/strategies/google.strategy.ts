

import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ConfigService } from "@nestjs/config"
import { Strategy, type VerifyCallback } from "passport-google-oauth20"
import { AuthService } from "../auth.service"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get("GOOGLE_CLIENT_ID"),
      clientSecret: configService.get("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.get("GOOGLE_CALLBACK_URL") || "/auth/google/callback",
      scope: ["email", "profile"],
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    try {
      const user = {
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        picture: profile.photos[0].value,
        googleId: profile.id, // This is the provider-specific ID
        provider: "google", // This comes as string from passport
        accessToken,
        refreshToken,
      }

      // Use the new validateOAuthUser method that handles the conversion
      const result = await this.authService.validateOAuthUser(user)
      return done(null, result)
    } catch (error) {
      return done(error, null)
    }
  }
}
