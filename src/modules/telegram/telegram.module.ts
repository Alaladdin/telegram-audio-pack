import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTelegramConfig } from '@/config';
import { TelegramUpdate } from '@/modules/telegram/telegram.update';
import { BOT_NAME } from '@/modules/telegram/telegram.constants';
import { TypegooseModule } from 'nestjs-typegoose';
import { AudioEntity } from '@/shared/entities/audio.entity';
import { I18nService } from 'nestjs-i18n';

@Module({
    imports: [
        TypegooseModule.forFeature([{ typegooseClass: AudioEntity }]),
        TelegrafModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService, I18nService],
            botName: BOT_NAME,
            useFactory: getTelegramConfig,
        }),
    ],
    providers: [TelegramUpdate, TelegramService],
})
export class TelegramModule {}
