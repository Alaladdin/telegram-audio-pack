import { BaseModel } from '@/shared/models';

export class UserModel extends BaseModel {
    userId: number;
    username?: string;
    displayName: string;
    firstName: string;
    lastName?: string;
    lang?: string;
    isBot: boolean;
}
