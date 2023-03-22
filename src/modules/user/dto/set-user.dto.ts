import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SetUserDto {
    @IsNumber()
    userId: number;

    @IsOptional()
    @IsString()
    username?: string;

    @IsString()
    displayName: string;

    @IsString()
    firstName: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    lang?: string;

    // @prop({ type: () => UserAccessEntity, _id: false, default: {} })
    // access?: UserAccessEntity;
}
