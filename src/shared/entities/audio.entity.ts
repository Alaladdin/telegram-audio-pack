import { modelOptions, prop } from '@typegoose/typegoose';
import { getDefaultDatabaseSchemaOptions } from '@/config';
import { UserEntity } from './user.entity';
import { TelegramAudioEntity } from '@/shared/entities/telegram-audio.entity';

@modelOptions({
    schemaOptions: {
        collection: 'audios',
        ...getDefaultDatabaseSchemaOptions(),
    },
})
export class AudioEntity {
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
