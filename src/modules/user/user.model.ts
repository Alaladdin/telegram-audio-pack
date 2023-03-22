import { BaseModel } from '@/shared/models';
import { UserAccessEntity } from '@/modules/user/entities';

export class UserModel extends BaseModel {
    userId: number;
    username?: string;
    displayName: string;
    firstName: string;
    lastName?: string;
    lang?: string;
    access?: UserAccessEntity;
}
