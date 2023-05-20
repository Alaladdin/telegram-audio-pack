import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache, Milliseconds } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);
    private readonly cachePrefix = '';

    /* prettier-ignore */
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly configService: ConfigService,
    ) {
        this.cachePrefix = this.configService.get('CACHE_PREFIX') || this.configService.get('npm_package_name') || '';
    }

    async get<T>(key: string) {
        const cacheKey = this.getCacheKey(key);

        this.logger.verbose(`[GET]: ${cacheKey}`);

        return this.cacheManager.get<T>(cacheKey);
    }

    async set(key: string, value: unknown, ttl?: Milliseconds) {
        const cacheKey = this.getCacheKey(key);

        this.logger.verbose(`[SET]: ${cacheKey}, ttl:${ttl}`);

        if (value !== undefined) {
            await this.cacheManager.set(cacheKey, value, ttl);
        }
    }

    async delete(key: string) {
        const cacheKey = this.getCacheKey(key);

        this.logger.verbose(`[DELETE]: ${cacheKey}`);

        await this.cacheManager.del(cacheKey);
    }

    async deleteFolder(prefix?: string) {
        const cacheKey = this.getCacheKey(prefix || '');
        const keys = await this.cacheManager.store.keys(cacheKey);

        this.logger.verbose(`[DELETE_FOLDER]: ${prefix}`);

        for (const key of keys) {
            await this.cacheManager.del(key);
        }
    }

    async deleteAll() {
        this.logger.verbose(`[DELETE_ALL]`);

        await this.cacheManager.reset();
    }

    private getCacheKey(key: string) {
        return [this.cachePrefix, key].join(':');
    }
}
