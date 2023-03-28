import { UserEntity } from '@/modules/user/entities';
import { FilterQuery, Types } from 'mongoose';
import { AudioEntity } from '@/modules/audio/entities';
import { Ref } from '@typegoose/typegoose';

export type UserRef = Ref<UserEntity>;
export type UpdateAudioFilter = Partial<Omit<AudioEntity, '_id'>> & { _id: Types.ObjectId };
export type DeleteAudioFilter = FilterQuery<Omit<AudioEntity, 'deletedAt'>>;
export type GetAudiosListFilter = FilterQuery<AudioEntity>;
