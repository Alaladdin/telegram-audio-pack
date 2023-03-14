import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { modelOptions, prop } from '@typegoose/typegoose';
import { getDefaultDatabaseSchemaOptions } from '@/config';
import { TelegramUser } from './telegram-user.entity';
import { TelegramAudio } from './telegram-audio';

@modelOptions({
  schemaOptions: {
    collection: 'audios',
    ...getDefaultDatabaseSchemaOptions(),
  },
})
export class AudioEntity extends TimeStamps {
  @prop({ type: () => TelegramAudio, _id: false, required: true })
  telegramMetadata: TelegramAudio;

  @prop({ uniq: true, required: true })
  name: string;

  @prop({ type: () => TelegramUser, _id: false, required: true })
  authoredBy: TelegramUser;

  @prop({ type: () => TelegramUser, _id: false, required: true })
  createdBy: TelegramUser;

  @prop({ default: 0 })
  usedTimes: number;
}
