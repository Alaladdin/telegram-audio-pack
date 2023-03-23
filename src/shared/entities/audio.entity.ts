import { modelOptions, prop } from '@typegoose/typegoose';
import { getDefaultDatabaseSchemaOptions } from '@/config';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { TelegramAudioEntity } from './telegram-audio.entity';
import { BaseEntity } from './base.entity';

@modelOptions({
    schemaOptions: {
        collection: 'audios',
        ...getDefaultDatabaseSchemaOptions(),
    },
})
export class AudioEntity extends BaseEntity {
    @prop({ uniq: true, required: true })
    name: string;

    @prop({ uniq: true, required: true })
    content: Buffer;

    @prop({ type: () => TelegramAudioEntity, _id: false, required: true })
    telegramMetadata: TelegramAudioEntity;

    @prop({ ref: () => UserEntity, required: true })
    authoredBy: UserEntity;

    @prop({ ref: () => UserEntity, required: true })
    createdBy: UserEntity;

    @prop({ ref: () => UserEntity, default: null })
    deletedBy?: UserEntity;

    @prop({ default: null })
    deletedAt?: Date;

    @prop({ default: 0 })
    usedTimes: number;
}
