import { UserEntity } from '@/modules/user/entities/user.entity';
import { TelegramAudioEntity } from './entities';
import { BaseModel } from '@models';

export class AudioModel extends BaseModel {
    name: string;
    content: Buffer;
    hash: string;
    telegramMetadata: TelegramAudioEntity;
    authoredBy: UserEntity;
    createdBy: UserEntity;
    deletedBy?: UserEntity;
    deletedAt?: Date;
    usedTimes: number;
}
