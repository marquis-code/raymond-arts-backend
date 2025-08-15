import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler } from "@nestjs/common"
import type { Reflector } from "@nestjs/core"
import { type Observable, of } from "rxjs"
import { tap } from "rxjs/operators"
import type { RedisService } from "../redis.service"
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from "../decorators/cache.decorator"

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(CACHE_KEY_METADATA, context.getHandler())

    const cacheTTL = this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler())

    if (!cacheKey) {
      return next.handle()
    }

    // Try to get from cache
    const cachedData = await this.redisService.get(cacheKey)
    if (cachedData) {
      return of(cachedData)
    }

    // If not in cache, execute method and cache result
    return next.handle().pipe(
      tap(async (data) => {
        await this.redisService.set(cacheKey, data, cacheTTL)
      }),
    )
  }
}
