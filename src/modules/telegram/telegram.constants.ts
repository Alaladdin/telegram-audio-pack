import { PathValue } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/localization.generated';

export const BOT_NAME = 'Audio Pack Bot';
export const TOP_AUDIOS_LIMIT = 5;
export const INLINE_QUERY_LIMIT = 50;
export const UNKNOWN_USER_NAME = 'INCOGNITO';
export const OWNER_ID = 398532631;
export const ADMINS_IDS = [OWNER_ID, 648639475, 865100224, 292285878, 541357698]; // mine, vova, popov, nikita, gera
export const BOT_COMMANDS_LIST: (keyof PathValue<I18nTranslations, 'commands'>)[] = [
    'start',
    'top',
    'manage',
    'help',
    'debug',
];

export const CHARS_TO_MD_ESCAPE = [
    '_',
    // '*',
    // '`',
    '[',
    ']',
    '(',
    ')',
    '~',
    '>',
    '#',
    '+',
    '-',
    '=',
    '|',
    '{',
    '}',
    '.',
    '!',
];
