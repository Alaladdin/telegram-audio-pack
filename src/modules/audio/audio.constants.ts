import { UserEntity } from '@/modules/user/entities';

export const CACHE_PREFIX = 'audio:';
export const POPULATE_USER_SELECT_FIELDS: { [key in keyof Partial<UserEntity>]: 0 | 1 } = {
    userId: 1,
    displayName: 1,
    username: 1,
};
