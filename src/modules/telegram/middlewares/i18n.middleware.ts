import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/localization.generated';
import { Context } from '@/modules/telegram/interfaces/context.interface';

export const i18nMiddleware = (i18n: I18nService<I18nTranslations>) => {
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
