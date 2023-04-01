import { BaseModel } from '@/shared/models';
import { Nullable } from '@types';

export class UserModel extends BaseModel {
    userId: number;
    username: Nullable<string>;
    displayName: string;
    firstName: string;
    lastName: Nullable<string>;
    lang?: string;
    isBot: boolean;
}
