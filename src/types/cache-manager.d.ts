declare module "cache-manager" {
    export interface Cache {
      get<T>(key: string): Promise<T | undefined>
      set<T>(key: string, value: T, ttl?: number): Promise<void>
      del(key: string): Promise<void>
      reset(): Promise<void>
      wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T>
      store: {
        reset(): Promise<void>
        keys(pattern?: string): Promise<string[]>
      }
    }
  
    export interface CacheManagerOptions {
      store?: any
      host?: string
      port?: number
      password?: string
      db?: number
      ttl?: number
    }
  
    export function caching(options: CacheManagerOptions): Cache
  }
  
  declare module "cache-manager-redis-store" {
    interface RedisStoreOptions {
      host?: string
      port?: number
      password?: string
      db?: number
      ttl?: number
      [key: string]: any
    }
  
    interface RedisStore {
      create(options?: RedisStoreOptions): any
    }
  
    const redisStore: RedisStore & ((options?: RedisStoreOptions) => any)
    export = redisStore
  }
  