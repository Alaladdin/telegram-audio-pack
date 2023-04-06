import { redisStore } from 'cache-manager-redis-store';
import { CacheModuleOptions } from '@nestjs/common';
import { ms } from '@utils';
import { ConfigService } from '@nestjs/config';

export const getCacheConfig = async (configService: ConfigService): Promise<CacheModuleOptions<any>> => {
    const redisHost = configService.get('REDIS_HOST') || 'localhost';
    const redisPort = configService.get('REDIS_PORT') || '6379';
    const redisUser = configService.get('REDIS_USER') || 'default';
    const redisPass = configService.get('REDIS_PASS') || '';
    const defaultTTL = ms('7d') / 1000;

    return {
        store: await redisStore({
            url: `redis://${redisUser}:${redisPass}@${redisHost}:${redisPort}`,
            ttl: configService.get('CACHE_TTL') || defaultTTL,
        }),
    };
};
