// import { Injectable, Logger } from "@nestjs/common"
// import { Cache } from "cache-manager"

// @Injectable()
// export class RedisService {
//   private readonly logger = new Logger(RedisService.name)

//   private cacheManager: Cache

//   constructor(cacheManager: Cache) {
//     this.cacheManager = cacheManager
//   }

//   /**
//    * Get data from cache
//    */
//   async get<T>(key: string): Promise<T | null> {
//     try {
//       const data = await this.cacheManager.get<T>(key)
//       if (data) {
//         this.logger.debug(`Cache hit for key: ${key}`)
//       } else {
//         this.logger.debug(`Cache miss for key: ${key}`)
//       }
//       return data || null
//     } catch (error) {
//       this.logger.error(`Error getting cache key ${key}:`, error)
//       return null
//     }
//   }

//   /**
//    * Set data in cache
//    */
//   async set<T>(key: string, value: T, ttl?: number): Promise<void> {
//     try {
//       await this.cacheManager.set(key, value, ttl)
//       this.logger.debug(`Cache set for key: ${key}`)
//     } catch (error) {
//       this.logger.error(`Error setting cache key ${key}:`, error)
//     }
//   }

//   /**
//    * Delete data from cache
//    */
//   async del(key: string): Promise<void> {
//     try {
//       await this.cacheManager.del(key)
//       this.logger.debug(`Cache deleted for key: ${key}`)
//     } catch (error) {
//       this.logger.error(`Error deleting cache key ${key}:`, error)
//     }
//   }

//   /**
//    * Clear all cache
//    */
//   async reset(): Promise<void> {
//     try {
//       const store = (this.cacheManager as any).store
//       if (store && typeof store.reset === "function") {
//         await store.reset()
//       } else if (store && store.client && typeof store.client.flushdb === "function") {
//         // Fallback to Redis client flushdb
//         await store.client.flushdb()
//       } else {
//         this.logger.warn("Reset method not available on cache store")
//         return
//       }
//       this.logger.debug("Cache cleared")
//     } catch (error) {
//       this.logger.error("Error clearing cache:", error)
//     }
//   }

//   /**
//    * Get or set pattern - if data doesn't exist in cache, execute callback and cache result
//    */
//   async getOrSet<T>(key: string, callback: () => Promise<T>, ttl?: number): Promise<T> {
//     try {
//       // Try to get from cache first
//       let data = await this.get<T>(key)

//       if (data === null) {
//         // If not in cache, execute callback
//         this.logger.debug(`Executing callback for cache key: ${key}`)
//         data = await callback()

//         // Store in cache
//         await this.set(key, data, ttl)
//       }

//       return data
//     } catch (error) {
//       this.logger.error(`Error in getOrSet for key ${key}:`, error)
//       // If cache fails, still execute callback
//       return await callback()
//     }
//   }

//   /**
//    * Generate cache key with prefix
//    */
//   generateKey(prefix: string, ...parts: (string | number)[]): string {
//     return `${prefix}:${parts.join(":")}`
//   }
// }


// import { Injectable, Logger, Inject } from "@nestjs/common"
// import { CACHE_MANAGER } from "@nestjs/cache-manager"
// import { Cache } from "cache-manager"

// @Injectable()
// export class RedisService {
//   private readonly logger = new Logger(RedisService.name)

//   constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

//   /**
//    * Get data from cache
//    */
//   async get<T>(key: string): Promise<T | null> {
//     try {
//       const data = await this.cacheManager.get<T>(key)
//       if (data) {
//         this.logger.debug(`Cache hit for key: ${key}`)
//       } else {
//         this.logger.debug(`Cache miss for key: ${key}`)
//       }
//       return data || null
//     } catch (error) {
//       this.logger.error(`Error getting cache key ${key}:`, error)
//       return null
//     }
//   }

//   /**
//    * Set data in cache
//    */
//   async set<T>(key: string, value: T, ttl?: number): Promise<void> {
//     try {
//       await this.cacheManager.set(key, value, ttl)
//       this.logger.debug(`Cache set for key: ${key}`)
//     } catch (error) {
//       this.logger.error(`Error setting cache key ${key}:`, error)
//     }
//   }

//   /**
//    * Delete data from cache
//    */
//   async del(key: string): Promise<void> {
//     try {
//       await this.cacheManager.del(key)
//       this.logger.debug(`Cache deleted for key: ${key}`)
//     } catch (error) {
//       this.logger.error(`Error deleting cache key ${key}:`, error)
//     }
//   }

//   /**
//    * Clear all cache
//    */
//   async reset(): Promise<void> {
//     try {
//       const store = (this.cacheManager as any).store
//       if (store && typeof store.reset === "function") {
//         await store.reset()
//       } else if (store && store.client && typeof store.client.flushdb === "function") {
//         // Fallback to Redis client flushdb
//         await store.client.flushdb()
//       } else {
//         this.logger.warn("Reset method not available on cache store")
//         return
//       }
//       this.logger.debug("Cache cleared")
//     } catch (error) {
//       this.logger.error("Error clearing cache:", error)
//     }
//   }

//   /**
//    * Get or set pattern - if data doesn't exist in cache, execute callback and cache result
//    */
//   async getOrSet<T>(key: string, callback: () => Promise<T>, ttl?: number): Promise<T> {
//     try {
//       // Try to get from cache first
//       let data = await this.get<T>(key)

//       if (data === null) {
//         // If not in cache, execute callback
//         this.logger.debug(`Executing callback for cache key: ${key}`)
//         data = await callback()

//         // Store in cache
//         await this.set(key, data, ttl)
//       }

//       return data
//     } catch (error) {
//       this.logger.error(`Error in getOrSet for key ${key}:`, error)
//       // If cache fails, still execute callback
//       return await callback()
//     }
//   }

//   /**
//    * Generate cache key with prefix
//    */
//   generateKey(prefix: string, ...parts: (string | number)[]): string {
//     return `${prefix}:${parts.join(":")}`
//   }

//   /**
//    * Get the underlying Redis client (if needed for advanced operations)
//    */
//   getRedisClient() {
//     const store = (this.cacheManager as any).store
//     return store?.client || null
//   }

//   /**
//    * Check if cache is healthy/connected
//    */
//   async isHealthy(): Promise<boolean> {
//     try {
//       await this.cacheManager.set('health-check', 'ok', 1)
//       const result = await this.cacheManager.get('health-check')
//       await this.cacheManager.del('health-check')
//       return result === 'ok'
//     } catch (error) {
//       this.logger.error('Cache health check failed:', error)
//       return false
//     }
//   }
// }


import { Injectable, Logger, Inject } from "@nestjs/common"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name)

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Get data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.cacheManager.get<T>(key)
      if (data !== undefined && data !== null) {
        this.logger.debug(`Cache hit for key: ${key}`)
        return data
      } else {
        this.logger.debug(`Cache miss for key: ${key}`)
        return null
      }
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error)
      return null
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        // Convert seconds to milliseconds if needed
        const ttlMs = ttl < 1000000 ? ttl * 1000 : ttl
        await this.cacheManager.set(key, value, ttlMs)
      } else {
        await this.cacheManager.set(key, value)
      }
      this.logger.debug(`Cache set for key: ${key}`)
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error)
    }
  }

  /**
   * Delete data from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key)
      this.logger.debug(`Cache deleted for key: ${key}`)
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error)
    }
  }

  /**
   * Delete multiple cache keys by pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const store = (this.cacheManager as any).store
      if (store && store.client) {
        const keys = await store.client.keys(pattern)
        if (keys.length > 0) {
          await Promise.all(keys.map((key: string) => this.del(key)))
          this.logger.debug(`Deleted ${keys.length} cache keys matching pattern: ${pattern}`)
        }
      }
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}:`, error)
    }
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    try {
      const store = (this.cacheManager as any).store
      if (store && typeof store.reset === "function") {
        await store.reset()
      } else if (store && store.client && typeof store.client.flushdb === "function") {
        // Fallback to Redis client flushdb
        await store.client.flushdb()
      } else {
        this.logger.warn("Reset method not available on cache store")
        return
      }
      this.logger.debug("Cache cleared")
    } catch (error) {
      this.logger.error("Error clearing cache:", error)
    }
  }

  /**
   * Get or set pattern - if data doesn't exist in cache, execute callback and cache result
   */
  async getOrSet<T>(key: string, callback: () => Promise<T>, ttl?: number): Promise<T> {
    try {
      // Try to get from cache first
      let data = await this.get<T>(key)

      if (data === null || data === undefined) {
        // If not in cache, execute callback
        this.logger.debug(`Executing callback for cache key: ${key}`)
        data = await callback()

        // Store in cache only if data is not null/undefined
        if (data !== null && data !== undefined) {
          await this.set(key, data, ttl)
        }
      }

      return data
    } catch (error) {
      this.logger.error(`Error in getOrSet for key ${key}:`, error)
      // If cache fails, still execute callback
      return await callback()
    }
  }

  /**
   * Generate cache key with prefix
   */
  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(":")}`
  }

  /**
   * Get the underlying Redis client (if needed for advanced operations)
   */
  getRedisClient() {
    const store = (this.cacheManager as any).store
    return store?.client || null
  }

  /**
   * Check if cache is healthy/connected
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.cacheManager.set('health-check', 'ok', 1000)
      const result = await this.cacheManager.get('health-check')
      await this.cacheManager.del('health-check')
      return result === 'ok'
    } catch (error) {
      this.logger.error('Cache health check failed:', error)
      return false
    }
  }

  /**
   * Get cache statistics (if available)
   */
  async getStats(): Promise<any> {
    try {
      const client = this.getRedisClient()
      if (client && typeof client.info === 'function') {
        const info = await client.info('memory')
        return {
          connected: true,
          info: info
        }
      }
      return { connected: false }
    } catch (error) {
      this.logger.error('Error getting cache stats:', error)
      return { connected: false, error: error.message }
    }
  }
}