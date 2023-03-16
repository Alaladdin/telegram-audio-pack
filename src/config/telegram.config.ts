import { useNewReplies } from 'telegraf/future';
import { TelegrafModuleOptions } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { BOT_NAME } from '@/modules/telegram/telegram.constants';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/localization.generated';
import { baseMiddleware, i18nMiddleware } from '@/modules/telegram/middlewares';

export const getTelegramConfig = (
    configService: ConfigService,
    i18n: I18nService<I18nTranslations>,
): TelegrafModuleOptions => ({
    botName: BOT_NAME,
    token: configService.get('BOT_TOKEN') || '',
    middlewares: [useNewReplies(), i18nMiddleware(i18n), baseMiddleware],
});
