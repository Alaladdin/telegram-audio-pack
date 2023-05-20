import { PathValue } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/localization.generated';

export const RENAME_AUDIO_SCENE_ID = 'RENAME_AUDIO_SCENE';
export const RENAME_AUDIO_SCENE_LEAVE_CODE = 'DISCARD';
export const BACKUP_FILE_NAME = 'backup.zip';
export const DATABASE_FILE_NAME = 'db.json';
export const BOT_NAME = 'Audio Pack Bot';
export const LIST_AUDIOS_LIMIT = 3;
export const TOP_AUDIOS_LIMIT = 5;
export const INLINE_QUERY_LIMIT = 50;
export const INLINE_QUERY_NEW_LIMIT = 5;
export const INLINE_QUERY_CACHE_TIME = 300;
export const UNKNOWN_USER_NAME = 'INCOGNITO';
export const OWNER_ID = 398532631;
export const ADMINS_IDS = [OWNER_ID, 756302997, 648639475, 865100224, 292285878, 541357698]; // mine, jan, vova, popov, nikita, gera
export const BOT_COMMANDS_LIST: (keyof PathValue<I18nTranslations, 'commands'>)[] = [
    'start',
    'top',
    'list',
    'stats',
    'get_backup',
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
