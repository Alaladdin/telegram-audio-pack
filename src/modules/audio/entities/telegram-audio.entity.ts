import { prop } from '@typegoose/typegoose';

export class TelegramAudioEntity {
    @prop({ uniq: true })
    fileId: string;

    @prop({ uniq: true, required: true })
    fileUniqueId: string;

    @prop({ required: true })
    duration: number;

    @prop({ default: null })
    size?: number;

    @prop({ default: null })
    mimeType?: string;
}
