import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-apple"
import { ConfigService } from "@nestjs/config"
import { AuthService } from "../auth.service"

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, "apple") {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get("APPLE_CLIENT_ID"),
      teamID: configService.get("APPLE_TEAM_ID"),
      keyID: configService.get("APPLE_KEY_ID"),
      privateKeyString: configService.get("APPLE_PRIVATE_KEY"),
      callbackURL: configService.get("APPLE_CALLBACK_URL") || "/auth/apple/callback",
      scope: ["name", "email"],
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: any,
    profile: any,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    try {
      const { email, name, sub } = idToken

      const user = {
        email: email,
        firstName: name?.firstName,
        lastName: name?.lastName,
        appleId: sub,
        provider: "apple",
        accessToken,
        refreshToken,
      }

      const result = await this.authService.validateSocialUser(user)
      done(null, result)
    } catch (error) {
      done(error, null)
    }
  }
}
