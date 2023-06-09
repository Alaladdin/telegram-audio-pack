import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';
import { AudioController } from '@/modules/audio/audio.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { AudioEntity } from '@/modules/audio/entities';
import { CacheModule } from '@/modules/cache/cache.module';
import { AnalyticsModule } from '@/modules/analytics/analytics.module';

@Module({
    imports: [
        CacheModule,
        AnalyticsModule, // prettier-ignore
        TypegooseModule.forFeature([{ typegooseClass: AudioEntity }]),
    ],
    controllers: [AudioController],
    providers: [AudioService],
    exports: [AudioService],
})
export class AudioModule {}
