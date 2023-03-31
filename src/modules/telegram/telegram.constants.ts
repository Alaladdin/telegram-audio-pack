import { PathValue } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/localization.generated';

export const BOT_NAME = 'Audio Pack Bot';
export const AUDIO_DEFAULT_NAME_PREFIX = 'audio_by_';
export const UNKNOWN_USER_NAME = 'INCOGNITO';
export const OWNER_ID = 398532631;
export const ADMINS_IDS = [OWNER_ID, 648639475, 865100224, 292285878]; // mine, vova, popov, nikita
export const BOT_COMMANDS_LIST: (keyof PathValue<I18nTranslations, 'commands'>)[] = [
    'start',
    'top',
    'list',
    'my_data',
    'debug',
];
