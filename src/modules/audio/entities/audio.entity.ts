import { modelOptions, plugin, prop } from '@typegoose/typegoose';
import { getDefaultDatabaseSchemaOptions } from '@/config';
import { TelegramAudioEntity } from './telegram-audio.entity';
import { BaseEntity } from '@entities';
import { mongooseLeanVirtuals } from 'mongoose-lean-virtuals';

@modelOptions({
    schemaOptions: {
        collection: 'audios',
        ...getDefaultDatabaseSchemaOptions(),
    },
})
@plugin(mongooseLeanVirtuals)
export class AudioEntity extends BaseEntity {
    @prop({ uniq: true })
    name: string;

    @prop({ required: true })
    content: Buffer;

    @prop({ type: () => TelegramAudioEntity, _id: false, required: true })
    voice: TelegramAudioEntity;

    @prop({ default: null })
    deletedAt?: Date;

    @prop({ default: 0 })
    usedTimes?: number;
}
