import { UserEntity } from '@/modules/user/entities';
import { FilterQuery, Types } from 'mongoose';
import { AudioEntity } from '@/modules/audio/entities';

export type UserRef = Pick<UserEntity, '_id'>;
export type UpdateAudioFilter = Partial<Omit<AudioEntity, '_id'>> & { _id: Types.ObjectId };
export type DeleteAudioFilter = FilterQuery<Omit<AudioEntity, 'deletedAt'>>;
export type GetAudiosListFilter = FilterQuery<AudioEntity>;
