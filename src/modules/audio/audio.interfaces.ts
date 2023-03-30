import { UserEntity } from '@/modules/user/entities';
import { FilterQuery, SortOrder, UpdateQuery } from 'mongoose';
import { AudioEntity } from '@/modules/audio/entities';

export type UserRef = Pick<UserEntity, '_id'>;
export type DeleteAudioFilter = FilterQuery<Omit<AudioEntity, 'deletedAt'>>;
export interface UpdateAudioParams {
    filter: FilterQuery<AudioEntity>;
    update: UpdateQuery<AudioEntity>;
}
export interface GetAudiosListParams {
    filter?: FilterQuery<AudioEntity>;
    options?: {
        limit?: number;
        sort?: { [key in keyof Partial<AudioEntity>]: SortOrder };
    };
}
