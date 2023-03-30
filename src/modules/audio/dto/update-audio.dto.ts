import { UserEntity } from '@/modules/user/entities';
import { Nullable } from '@types';
import { AudioModel } from '@/modules/audio/audio.model';

export class UpdateAudioDto {
    id: AudioModel['id'];
    name?: string;
    deletedBy?: Nullable<UserEntity>;
    deletedAt?: Nullable<Date>;
    usedTimes?: number;
}
