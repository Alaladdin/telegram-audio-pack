import { FilterQuery, UpdateQuery } from 'mongoose';
import { AudioEntity } from '@/modules/audio/entities';

export type DeleteAudioFilter = FilterQuery<Omit<AudioEntity, 'deletedAt'>>;
export interface UpdateAudioParams {
    filter: FilterQuery<AudioEntity>;
    update: UpdateQuery<AudioEntity>;
}
export type PopulateAudioFields = {
    [key in keyof Partial<AudioEntity>]: 0 | 1;
};
export interface GetAudiosListParams {
    filter?: FilterQuery<AudioEntity>;
    limit?: number;
    select?: PopulateAudioFields;
}
