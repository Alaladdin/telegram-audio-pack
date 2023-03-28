import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';
import { AudioController } from '@/modules/audio/audio.controller';

@Module({
    controllers: [AudioController],
    providers: [AudioService],
    exports: [AudioService],
})
export class AudioModule {}
