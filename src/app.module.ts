import { Module } from '@nestjs/common';
import { TelegramModule } from '@/modules/telegram/telegram.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig, getEnvFilePath, getLocalizationConfig } from '@/config';
import { TypegooseModule } from 'nestjs-typegoose';
import { I18nModule } from 'nestjs-i18n';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: getEnvFilePath(),
      cache: true,
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
    TelegramModule,
  ],
})
export class AppModule {}
