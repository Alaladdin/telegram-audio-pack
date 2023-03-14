import { prop } from '@typegoose/typegoose';

export class TelegramUser {
  @prop({ required: true })
  id: number;

  @prop({ default: null })
  username: string;

  // plain name?
}
