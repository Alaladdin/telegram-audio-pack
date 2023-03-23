import { Context as tgContext } from 'telegraf';
import { I18nTranslations } from '@/generated/localization.generated';
import { PathImpl2 } from '@nestjs/config';
import { TranslateOptions } from 'nestjs-i18n/dist/services/i18n.service';
import { CallbackQuery, Update, Message } from 'typegram';
import { ExtraReplyMessage } from 'telegraf/src/telegram-types';

interface BaseContext {
    displayName: string;
    isAdmin: boolean;
    $t: (key: PathImpl2<I18nTranslations>, options?: TranslateOptions) => string;
    $replyWithMarkdown: (text: string, extra?: ExtraReplyMessage) => ReturnType<tgContext['replyWithMarkdownV2']>;
}

interface CallbackQueryWithData<T extends Message.CommonMessage> extends Omit<CallbackQuery.DataQuery, 'message'> {
    message: Omit<Message.CommonMessage, 'reply_to_message'> & { reply_to_message: T };
    data: 'SAVE_AUDIO' | 'DISCARD_AUDIO' | 'EDIT_AUDIO' | 'DELETE_AUDIO';
}

export type CallbackQueryUpdateType =
    | (Omit<Message.AudioMessage, 'reply_to_message'> & { voice: undefined })
    | (Omit<Message.VoiceMessage, 'reply_to_message'> & { audio: undefined });

export interface CallbackQueryContext
    extends tgContext<Update.CallbackQueryUpdate<CallbackQueryWithData<CallbackQueryUpdateType>>>,
        BaseContext {}

export interface ChosenInlineResultContext extends tgContext<Update.ChosenInlineResultUpdate>, BaseContext {}

export interface Context extends tgContext, BaseContext {}
export interface AudioContext extends tgContext<Update.MessageUpdate<Message.AudioMessage>>, BaseContext {}
export interface MessageContext extends tgContext<Update.MessageUpdate>, BaseContext {}
