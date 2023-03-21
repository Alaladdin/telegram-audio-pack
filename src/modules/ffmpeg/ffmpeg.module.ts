import { Module } from '@nestjs/common';
import { FfmpegService } from '@/modules/ffmpeg/ffmpeg.service';

@Module({
    providers: [FfmpegService],
    exports: [FfmpegService],
})
export class FfmpegModule {}
