import { UserModel } from '@/modules/user/user.model';
import { User, Audio, Voice } from 'typegram';

export interface TelegramUser extends Omit<User, 'is_premium' | 'added_to_attachment_menu'> {}
export interface TelegramAudio extends Audio, Voice {}

export interface UserData {
    title: keyof UserModel | string;
    value?: string | number | boolean | null;
}

export interface GetAudioData {
    audio: Audio;
    author: UserModel;
}

export interface GetVoiceData {
    author: UserModel;
}
