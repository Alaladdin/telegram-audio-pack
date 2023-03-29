import * as path from 'path';
import { I18nOptions } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';

export const getLocalizationConfig = (configService: ConfigService): I18nOptions => ({
    fallbackLanguage: configService.get('FALLBACK_LANGUAGE') || 'ru',
    loaderOptions: {
        path: path.join(__dirname, '../localization/translations/'),
        watch: true,
    },
    typesOutputPath: path.join(__dirname, '../../src/generated/localization.generated.ts'),
    logging: true,
});
