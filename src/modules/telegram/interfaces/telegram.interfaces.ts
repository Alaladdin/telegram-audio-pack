import { UserModel } from '@/modules/user/user.model';
import { User, Audio } from 'typegram';

export interface TelegramUser extends Omit<User, 'is_premium' | 'added_to_attachment_menu'> {}

export interface UserData {
    title: keyof UserModel;
    value: UserModel[UserData['title']];
}
