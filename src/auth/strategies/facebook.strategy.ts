import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, type Profile } from "passport-facebook"
import { ConfigService } from "@nestjs/config"
import { AuthService } from "../auth.service"

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get("FACEBOOK_APP_ID"),
      clientSecret: configService.get("FACEBOOK_APP_SECRET"),
      callbackURL: configService.get("FACEBOOK_CALLBACK_URL") || "/auth/facebook/callback",
      scope: "email",
      profileFields: ["emails", "name", "picture.type(large)"],
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    try {
      const { name, emails, photos, id } = profile

      const user = {
        email: emails?.[0]?.value,
        firstName: name?.givenName,
        lastName: name?.familyName,
        picture: photos?.[0]?.value,
        facebookId: id,
        provider: "facebook",
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
