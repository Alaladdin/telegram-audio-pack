import { prop } from '@typegoose/typegoose';

export class TelegramAudio {
  @prop({ required: true })
  fileId: string;

  @prop({ uniq: true, required: true })
  fileUniqueId: string;

  @prop({ required: true })
  duration: number;

  @prop({ required: true })
  size: number;

  @prop({ default: null })
  mimeType: string;
}
