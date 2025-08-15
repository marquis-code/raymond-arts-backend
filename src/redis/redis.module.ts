// import { Module, Global } from "@nestjs/common"
// import { CacheModule } from "@nestjs/cache-manager"
// import { ConfigModule, ConfigService } from "@nestjs/config"
// import { redisStore } from "cache-manager-redis-store"
// import { RedisService } from "./redis.service"

// @Global()
// @Module({
//   imports: [
//     CacheModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (configService: ConfigService) => {
//         const store = await redisStore({
//           socket: {
//             host: configService.get("REDIS_HOST", "localhost"),
//             port: configService.get("REDIS_PORT", 6379),
//           },
//           password: configService.get("REDIS_PASSWORD"),
//           database: configService.get("REDIS_DB", 0),
//           ttl: configService.get("REDIS_TTL", 3600), // 1 hour default
//         })

//         return {
//           store: () => store,
//           ttl: configService.get("REDIS_TTL", 3600),
//           max: configService.get("REDIS_MAX_ITEMS", 100),
//         }
//       },
//     }),
//   ],
//   providers: [RedisService],
//   exports: [CacheModule, RedisService],
// })
// export class RedisModule {}


import { Module, Global } from "@nestjs/common"
import { CacheModule } from "@nestjs/cache-manager"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { redisStore } from "cache-manager-redis-yet"
import { RedisService } from "./redis.service"

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get("REDIS_HOST", "localhost"),
            port: configService.get("REDIS_PORT", 6379),
          },
          password: configService.get("REDIS_PASSWORD"),
          database: configService.get("REDIS_DB", 0),
        })

        return {
          store: store,
          ttl: configService.get("REDIS_TTL", 3600) * 1000, // Convert to milliseconds
          max: configService.get("REDIS_MAX_ITEMS", 100),
        }
      },
    }),
  ],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}