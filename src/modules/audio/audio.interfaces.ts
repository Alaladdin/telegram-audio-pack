import { FilterQuery, UpdateQuery } from 'mongoose';
import { AudioEntity } from '@/modules/audio/entities';
import { AudioModel } from '@/modules/audio/audio.model';

export type SelectAudioFields = {
    [key in keyof Partial<AudioEntity>]: 0 | 1;
};

export interface UpdateAudioParams {
    filter: FilterQuery<AudioEntity>;
    update: UpdateQuery<AudioEntity>;
}

export interface GetAudioParams {
    filter?: FilterQuery<AudioEntity>;
    select?: SelectAudioFields;
}

export interface GetAudiosListParams {
    filter?: FilterQuery<AudioEntity>;
    select?: SelectAudioFields;
    limit?: number;
}

export interface AudioModelCached extends Omit<AudioModel, 'content'> {
    content: ArrayBuffer;
}
