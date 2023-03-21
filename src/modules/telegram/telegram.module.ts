import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getHttpConfig, getTelegramConfig } from '@/config';
import { TelegramUpdate } from '@/modules/telegram/telegram.update';
import { BOT_NAME } from '@/modules/telegram/telegram.constants';
import { TypegooseModule } from 'nestjs-typegoose';
import { AudioEntity, UserEntity } from '@entities';
import { I18nService } from 'nestjs-i18n';
import { HttpModule } from '@nestjs/axios';
import { FfmpegModule } from '@/modules/ffmpeg/ffmpeg.module';

@Module({
    imports: [
        ConfigModule,
        TypegooseModule.forFeature([{ typegooseClass: AudioEntity }, { typegooseClass: UserEntity }]),
        HttpModule.registerAsync({ useFactory: getHttpConfig }),
        TelegrafModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService, I18nService],
            botName: BOT_NAME,
            useFactory: getTelegramConfig,
        }),
        FfmpegModule,
    ],
    providers: [TelegramUpdate, TelegramService],
})
export class TelegramModule {}
