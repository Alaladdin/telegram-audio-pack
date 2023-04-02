import { UserEntity } from '@/modules/user/entities/user.entity';
import { TelegramAudioEntity } from './entities';
import { BaseModel } from '@models';
import { Nullable } from '@types';

export class AudioModel extends BaseModel {
    name: string;
    content: Buffer;
    voice: TelegramAudioEntity;
    deletedAt?: Nullable<Date>;
    usedTimes: number;
}
