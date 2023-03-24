import { modelOptions, prop, Ref } from '@typegoose/typegoose';
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
    @prop({ uniq: true })
    name: string;

    @prop({ required: true })
    content: Buffer;

    @prop({ uniq: true })
    hash: string;

    @prop({ type: () => TelegramAudioEntity, _id: false, required: true })
    telegramMetadata: TelegramAudioEntity;

    @prop({ ref: () => UserEntity, required: true })
    authoredBy: Ref<UserEntity>;

    @prop({ ref: () => UserEntity, required: true })
    createdBy: Ref<UserEntity>;

    @prop({ ref: () => UserEntity, default: null })
    deletedBy?: Ref<UserEntity>;

    @prop({ default: null })
    deletedAt?: Date;

    @prop({ default: 0 })
    usedTimes: number;
}
