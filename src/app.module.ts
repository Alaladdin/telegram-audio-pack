import { Module } from '@nestjs/common';
import { TelegramModule } from '@/modules/telegram/telegram.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig, getEnvFilePath, getLocalizationConfig, getSentryConfig } from '@/config';
import { TypegooseModule } from 'nestjs-typegoose';
import { I18nModule } from 'nestjs-i18n';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryModule } from '@ntegral/nestjs-sentry';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: getEnvFilePath(),
            cache: true,
            isGlobal: true,
        }),
        SentryModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getSentryConfig,
        }),
        TypegooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getDatabaseConfig,
        }),
        I18nModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getLocalizationConfig,
        }),
        ScheduleModule.forRoot(),
        TelegramModule,
    ],
})
export class AppModule {}
