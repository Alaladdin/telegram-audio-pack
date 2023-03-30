import { PathValue } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/localization.generated';

export const BOT_NAME = 'Audio Pack Bot';
export const UNKNOWN_USER_NAME = 'INCOGNITO';
export const ADMINS_IDS = [398532631, 648639475, 865100224, 292285878]; // mine, vova, popov, nikita
export const BOT_COMMANDS_LIST: (keyof PathValue<I18nTranslations, 'commands'>)[] = [
    'start',
    'top',
    'top_personal',
    'list',
    'my_data',
    'debug',
];
