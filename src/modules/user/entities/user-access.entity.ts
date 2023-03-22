import { prop } from '@typegoose/typegoose';

export class UserAccessEntity {
    @prop({ default: false })
    canManageUsers: boolean;

    @prop({ default: false })
    canCreateAudio: boolean;

    @prop({ default: false })
    canEditAudio: boolean;

    @prop({ default: false })
    canDeleteAudio: boolean;
}
