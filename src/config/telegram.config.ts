import { useNewReplies } from 'telegraf/future';
import { TelegrafModuleOptions } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { BOT_NAME } from '@/modules/telegram/telegram.constants';
import { I18nService } from 'nestjs-i18n';
import { Context } from '@/modules/telegram/interfaces/context.interface';
import { I18nTranslations } from '@/generated/localization.generated';

const i18nMiddleware = (i18n: I18nService<I18nTranslations>) => {
  return (ctx: Context, next: () => Promise<void>) => {
    ctx.$t = (key, options) => {
      return i18n.translate(key, {
        lang: ctx.from?.language_code,
        ...options,
      });
    };

    next();
  };
};

export const getTelegramConfig = (
  configService: ConfigService,
  i18n: I18nService<I18nTranslations>,
): TelegrafModuleOptions => ({
  botName: BOT_NAME,
  token: configService.get('BOT_TOKEN') || '',
  middlewares: [useNewReplies(), i18nMiddleware(i18n)],
});
