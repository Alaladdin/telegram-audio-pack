import { CacheModule as NestCacheModule, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getCacheConfig } from '@/config';

@Module({
    imports: [
        NestCacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getCacheConfig,
            isGlobal: true,
        }),
    ],
    providers: [CacheService],
    exports: [CacheService],
})
export class CacheModule {}
