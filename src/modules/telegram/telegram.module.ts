import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getHttpConfig, getTelegramConfig } from '@/config';
import { TelegramUpdate } from '@/modules/telegram/telegram.update';
import { BOT_NAME } from '@/modules/telegram/telegram.constants';
import { I18nService } from 'nestjs-i18n';
import { HttpModule } from '@nestjs/axios';
import { FfmpegModule } from '@/modules/ffmpeg/ffmpeg.module';
import { AudioModule } from '@/modules/audio/audio.module';
import { RenameAudioScene } from '@/modules/telegram/scenes';

@Module({
    imports: [
        ConfigModule,
        HttpModule.registerAsync({ useFactory: getHttpConfig }),
        TelegrafModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService, I18nService],
            botName: BOT_NAME,
            useFactory: getTelegramConfig,
        }),
        AudioModule,
        FfmpegModule,
    ],
    providers: [TelegramUpdate, TelegramService, RenameAudioScene],
})
export class TelegramModule {}
