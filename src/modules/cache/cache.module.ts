import { CacheModule as NestCacheModule, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getCacheConfig } from '@/config';
import { RedisStore } from 'cache-manager-redis-store';

@Module({
    imports: [
        NestCacheModule.registerAsync<RedisStore>({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getCacheConfig,
        }),
    ],
    providers: [CacheService],
    exports: [CacheService],
})
export class CacheModule {}
