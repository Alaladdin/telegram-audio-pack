import { User, Audio, Voice } from 'typegram';

export interface TelegramUser extends Omit<User, 'is_premium' | 'added_to_attachment_menu'> {}
export interface TelegramAudio extends Audio, Voice {}
