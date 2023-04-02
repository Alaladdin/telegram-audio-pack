import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache, Milliseconds } from 'cache-manager';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async get<T>(key: string) {
        this.logger.verbose(`[GET]: ${key}`);

        return this.cacheManager.get<T>(key);
    }

    async set(key: string, value: unknown, ttl?: Milliseconds) {
        this.logger.verbose(`[SET]: ${key}:${value}, ttl:${ttl}`);

        if (value !== undefined) {
            await this.cacheManager.set(key, value, ttl);
        }
    }

    async delete(key: string) {
        this.logger.verbose(`[DELETE]: ${key}`);

        await this.cacheManager.del(key);
    }

    async deleteFolder(prefix?: string) {
        const keys = await this.cacheManager.store.keys(prefix);

        this.logger.verbose(`[DELETE_FOLDER]: ${prefix}`);

        for (const key of keys) {
            await this.cacheManager.del(key);
        }
    }

    async deleteAll() {
        this.logger.verbose(`[DELETE_ALL]`);

        await this.cacheManager.reset();
    }
}
