import { PathValue } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/localization.generated';

export const BOT_NAME = 'Rako4ka';
export const ADMINS_IDS = [398532631];
export const BOT_COMMANDS_LIST: (keyof PathValue<I18nTranslations, 'commands'>)[] = [
    'start',
    'list',
    'stats',
    'settings',
    'debug',
];
