// import { Injectable } from "@nestjs/common"
// import { PassportStrategy } from "@nestjs/passport"
// import { ExtractJwt, Strategy } from "passport-jwt"
// import { ConfigService } from "@nestjs/config"

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private configService: ConfigService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: configService.get("jwt.secret"),
//     })
//   }

//   async validate(payload: any) {
//     return {
//       sub: payload.sub,
//       email: payload.email,
//       role: payload.role,
//     }
//   }
// }


// import { Injectable } from "@nestjs/common"
// import { PassportStrategy } from "@nestjs/passport"
// import { ExtractJwt, Strategy } from "passport-jwt"
// import { ConfigService } from "@nestjs/config"

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private configService: ConfigService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: configService.get<string>("JWT_SECRET"), // Use environment variable name directly
//     })
//   }

//   async validate(payload: any) {
//     return {
//       sub: payload.sub,
//       email: payload.email,
//       role: payload.role,
//     }
//   }
// }


import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // First, get the secret
    const secret =
      configService.get("JWT_SECRET") ||
      configService.get("jwt.secret") ||
      process.env.JWT_SECRET ||
      "fallback-secret-for-development"

    if (!secret) {
      console.error("JWT secret is not defined! Using fallback secret for development only.")
    }

    // Call super with the configuration
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })

    // Move logging after super() call
    console.log("JWT_SECRET:", this.configService.get("JWT_SECRET"))
    console.log("jwt.secret:", this.configService.get("jwt.secret"))
  }

  async validate(payload: any) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  }
}