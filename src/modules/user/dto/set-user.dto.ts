import { Nullable } from '@types';

export class SetUserDto {
    userId: number;
    username: Nullable<string>;
    displayName: string;
    firstName: string;
    lastName: Nullable<string>;
    lang?: string;
    isBot?: boolean;
}
