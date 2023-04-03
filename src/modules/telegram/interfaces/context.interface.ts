import { Context as tgContext, Scenes } from 'telegraf';
import { TranslateOptions } from 'nestjs-i18n/dist/services/i18n.service';
import { CallbackQuery, Update, Message, User } from 'typegram';
import { ExtraReplyMessage } from 'telegraf/src/telegram-types';
import { I18nKey } from '@/shared/types/18n.types';

export type ExtraSendMessage = Parameters<tgContext['sendMessage']>['1'];
interface BaseContext {
    displayName: string;
    isAdmin: boolean;
    $t: (key: I18nKey, options?: TranslateOptions) => string;
    $sendMessageWithMD: (message: string, extra?: ExtraSendMessage) => ReturnType<tgContext['sendMessage']>;
    $replyWithMD: (message: string, extra?: ExtraReplyMessage) => ReturnType<tgContext['replyWithMarkdownV2']>;
    $replyWithMDCode: (message: string, extra?: ExtraReplyMessage) => ReturnType<tgContext['replyWithMarkdownV2']>;
}

interface CallbackQueryWithData<T extends Message.CommonMessage> extends Omit<CallbackQuery.DataQuery, 'message'> {
    message: Omit<Message.CommonMessage, 'reply_to_message'> & { from: User; reply_to_message: T };
    data: 'SAVE_AUDIO' | 'DISCARD_AUDIO' | 'RESTORE_AUDIO' | 'RENAME_AUDIO' | 'DELETE_AUDIO';
}

export type CallbackQueryUpdateType =
    | (Omit<Message.AudioMessage, 'reply_to_message'> & { voice: undefined })
    | (Omit<Message.VoiceMessage, 'reply_to_message'> & { audio: undefined });

export interface CallbackQueryContext
    extends tgContext<Update.CallbackQueryUpdate<CallbackQueryWithData<CallbackQueryUpdateType>>>,
        BaseContext {}

export interface Context extends tgContext, BaseContext {}
export interface AudioContext extends tgContext<Update.MessageUpdate<Message.AudioMessage>>, BaseContext {}
export interface MessageContext extends tgContext<Update.MessageUpdate>, BaseContext {}
export interface InlineQueryContext extends tgContext<Update.InlineQueryUpdate>, BaseContext {}
export interface ChosenInlineResultContext extends tgContext<Update.ChosenInlineResultUpdate>, BaseContext {}
export interface SceneContext extends Scenes.SceneContext, BaseContext {}
