// import { Module } from "@nestjs/common"
// import { PassportModule } from "@nestjs/passport"
// import { JwtModule } from "@nestjs/jwt"
// import { ConfigModule, ConfigService } from "@nestjs/config"
// import { AuthService } from "./auth.service"
// import { AuthController } from "./auth.controller"
// import { UsersModule } from "../users/users.module"
// import { JwtStrategy } from "./strategies/jwt.strategy"
// import { LocalStrategy } from "./strategies/local.strategy"
// import { EmailModule } from "../email/email.module"
// import { AuditModule } from "../audit/audit.module"

// @Module({
//   imports: [
//     UsersModule,
//     PassportModule,
//     EmailModule,
//     AuditModule,
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (configService: ConfigService) => ({
//         secret: configService.get("jwt.secret"),
//         signOptions: {
//           expiresIn: configService.get("jwt.expiresIn", "1d"),
//         },
//       }),
//     }),
//   ],
//   providers: [AuthService, JwtStrategy, LocalStrategy],
//   controllers: [AuthController],
//   exports: [AuthService],
// })
// export class AuthModule {}


// import { Module } from "@nestjs/common"
// import { PassportModule } from "@nestjs/passport"
// import { JwtModule } from "@nestjs/jwt"
// import { ConfigModule, ConfigService } from "@nestjs/config"
// import { AuthService } from "./auth.service"
// import { AuthController } from "./auth.controller"
// import { UsersModule } from "../users/users.module"
// import { JwtStrategy } from "./strategies/jwt.strategy"
// import { LocalStrategy } from "./strategies/local.strategy"
// import { EmailModule } from "../email/email.module"
// import { AuditUtilityModule } from "../common/modules/audit-utility.module"

// @Module({
//   imports: [
//     UsersModule,
//     PassportModule,
//     EmailModule,
//     AuditUtilityModule,
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (configService: ConfigService) => ({
//         secret: configService.get("jwt.secret"),
//         signOptions: {
//           expiresIn: configService.get("jwt.expiresIn", "1d"),
//         },
//       }),
//     }),
//   ],
//   providers: [AuthService, JwtStrategy, LocalStrategy],
//   controllers: [AuthController],
//   exports: [AuthService],
// })
// export class AuthModule {}

// import { Module } from "@nestjs/common"
// import { PassportModule } from "@nestjs/passport"
// import { JwtModule } from "@nestjs/jwt"
// import { ConfigModule, ConfigService } from "@nestjs/config"
// import { AuthService } from "./auth.service"
// import { AuthController } from "./auth.controller"
// import { UsersModule } from "../users/users.module"
// import { JwtStrategy } from "./strategies/jwt.strategy"
// import { LocalStrategy } from "./strategies/local.strategy"
// import { EmailModule } from "../email/email.module"
// import { AuditUtilityModule } from "../common/modules/audit-utility.module"

// @Module({
//   imports: [
//     ConfigModule, // Make sure ConfigModule is imported directly
//     UsersModule,
//     PassportModule,
//     EmailModule,
//     AuditUtilityModule,
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (configService: ConfigService) => ({
//         secret: configService.get<string>("JWT_SECRET"), // Use environment variable name directly
//         signOptions: {
//           expiresIn: configService.get<string>("JWT_EXPIRES_IN", "1d"),
//         },
//       }),
//     }),
//   ],
//   providers: [AuthService, JwtStrategy, LocalStrategy],
//   controllers: [AuthController],
//   exports: [AuthService],
// })
// export class AuthModule {}


import { Module } from "@nestjs/common"
import { PassportModule } from "@nestjs/passport"
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UsersModule } from "../users/users.module"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { LocalStrategy } from "./strategies/local.strategy"
import { EmailModule } from "../email/email.module"
import { AuditUtilityModule } from "../common/modules/audit-utility.module"

@Module({
  imports: [
    ConfigModule, // Make sure ConfigModule is imported directly
    UsersModule,
    PassportModule,
    EmailModule,
    AuditUtilityModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // Try multiple ways to get the secret
        const secret =
          configService.get("JWT_SECRET") ||
          configService.get("jwt.secret") ||
          process.env.JWT_SECRET ||
          "fallback-secret-for-development"

        if (!secret) {
          console.error("JWT secret is not defined! Using fallback secret for development only.")
        }

        return {
          secret: secret,
          signOptions: {
            expiresIn: configService.get("JWT_EXPIRES_IN") || configService.get("jwt.expiresIn") || "1d",
          },
        }
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

