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

    @prop({ type: () => UserEntity, _id: false, required: true })
    authoredBy: UserEntity;

    @prop({ type: () => UserEntity, _id: false, required: true })
    createdBy: UserEntity;

    @prop({ default: null })
    deletedAt: UserEntity;

    @prop({ type: () => UserEntity, _id: false, default: null })
    deletedBy: Date;

    @prop({ default: 0 })
    usedTimes: number;
}
