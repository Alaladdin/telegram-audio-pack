import { CacheModuleOptions } from '@nestjs/common';
import { ms } from '@utils';
import { ConfigService } from '@nestjs/config';

export const getCacheConfig = (configService: ConfigService): CacheModuleOptions => ({
    ttl: configService.get('CACHE_TTL') || ms('7d'),
    isGlobal: true,
});
