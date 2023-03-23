import { UserModel } from '@/modules/user/user.model';

export interface UserData {
    title: keyof UserModel;
    value: UserModel[UserData['title']];
}
