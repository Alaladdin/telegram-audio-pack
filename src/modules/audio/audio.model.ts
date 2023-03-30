import { UserEntity } from '@/modules/user/entities/user.entity';
import { TelegramAudioEntity } from './entities';
import { BaseModel } from '@models';
import { Nullable } from '@types';

export class AudioModel extends BaseModel {
    name: string;
    content: Buffer;
    telegramMetadata: TelegramAudioEntity;
    authoredBy: UserEntity;
    createdBy: UserEntity;
    deletedBy?: Nullable<UserEntity>;
    deletedAt?: Nullable<Date>;
    usedTimes: number;
}
