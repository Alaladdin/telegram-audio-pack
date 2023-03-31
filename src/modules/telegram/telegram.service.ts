import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { I18nTranslations } from '@/generated/localization.generated';
import { each, filter, map, some } from '@utils';
import { Markup, Telegraf } from 'telegraf';
import {
    AudioContext,
    CallbackQueryContext,
    ChosenInlineResultContext,
    Context,
    GetAudioData,
    GetVoiceData,
    InlineQueryContext,
    MessageContext,
    UserData,
} from './interfaces';
import { ADMINS_IDS, AUDIO_DEFAULT_NAME_PREFIX, BOT_COMMANDS_LIST } from './telegram.constants';
import { FfmpegService } from '@/modules/ffmpeg/ffmpeg.service';
import { formatDate } from '@utils';
import { UserService } from '@/modules/user/user.service';
import { EMPTY_VALUE } from '@constants';
import { AudioService } from '@/modules/audio/audio.service';
import { AudioModel } from '@/modules/audio/audio.model';
import { getMappedTelegramAudio, getMappedUser } from './utils';
import { ExtraEditMessageCaption } from 'telegraf/typings/telegram-types';
import { TelegrafException } from 'nestjs-telegraf';

@Injectable()
export class TelegramService {
    private readonly isProd: boolean = true;

    constructor(
        private readonly configService: ConfigService,
        private readonly i18n: I18nService<I18nTranslations>,
        private readonly httpService: HttpService,
        private readonly audioService: AudioService,
        private readonly userService: UserService,
        private readonly ffmpegService: FfmpegService,
    ) {
        this.isProd = this.configService.get('NODE_ENV') === 'production';
    }

    async setBotCommands(bot: Telegraf<Context>) {
        const languages = this.i18n.getSupportedLanguages();

        for await (const lang of languages) {
            const botCommands = map(BOT_COMMANDS_LIST, (command) => ({
                command,
                description: this.i18n.t(`commands.${command}`, { lang }),
            }));

            await bot.telegram.setMyCommands(botCommands, { language_code: lang });
        }
    }

    async onStartCommand(ctx: MessageContext) {
        const user = await this.userService.createOrUpdateUser(getMappedUser(ctx.from));
        const message = ctx.$t('replies.greeting', { args: { name: user.displayName } });

        await ctx.$replyWithMarkdown(message);
    }

    async onGetTop(ctx: MessageContext) {
        const audiosList = await this.audioService.getAudiosList({
            filter: { deletedAt: null },
            options: { limit: 5, sort: { usedTimes: 'desc' } },
        });

        if (audiosList.length) {
            await ctx.$sendMessageWithMarkdown(ctx.$t('replies.top_audios_list'));

            each(audiosList, (audio) => {
                const message = ctx.$t('replies.used_times', { args: { count: audio.usedTimes } });

                ctx.sendAudio(
                    {
                        filename: audio.name,
                        source: audio.content,
                    },
                    {
                        title: audio.name,
                        caption: `\`${message}\``,
                        performer: audio.authoredBy.displayName,
                        duration: audio.telegramMetadata.duration,
                        parse_mode: 'MarkdownV2',
                        disable_notification: true,
                    },
                );
            });
        } else {
            await ctx.$sendMessageWithMarkdown('No audios');
        }
    }

    async onGetList(ctx: Context) {
        const audiosList = await this.audioService.getAudiosList({
            options: { sort: { createdAt: 'desc' } },
        });

        if (audiosList.length) {
            await ctx.$sendMessageWithMarkdown(ctx.$t('replies.audios_list'));

            each(audiosList, (audio) => {
                const messageInfo = this.getMessageInfo(ctx, audio);

                ctx.sendAudio(
                    {
                        filename: audio.name,
                        source: audio.content,
                    },
                    {
                        title: audio.name,
                        caption: messageInfo.message,
                        reply_markup: { inline_keyboard: messageInfo.inlineKeyboard },
                        performer: audio.authoredBy.displayName,
                        duration: audio.telegramMetadata.duration,
                        parse_mode: 'MarkdownV2',
                        disable_notification: true,
                    },
                );
            });
        } else {
            await ctx.$sendMessageWithMarkdown('No audios');
        }
    }

    async onGetMyData(ctx: MessageContext) {
        const user = await this.userService.getUser(ctx.from.id);
        let message = ctx.$t('base.not_found');
        let messageExtra = {};

        if (user) {
            if (!ctx.isAdmin) {
                messageExtra = Markup.inlineKeyboard([
                    [Markup.button.callback(ctx.$t('actions.delete'), 'DELETE_MY_DATA')],
                ]);
            }

            const rawMessageList: UserData[] = [
                { title: 'userId', value: user.userId },
                { title: 'firstName', value: user.firstName },
                { title: 'lastName', value: user.lastName },
                { title: 'displayName', value: user.displayName },
                { title: 'lang', value: user.lang },
                { title: 'updatedAt', value: formatDate(user.updatedAt) },
                { title: 'createdAt', value: formatDate(user.createdAt) },
                { title: 'isBot', value: user.isBot },
            ];

            message = map(rawMessageList, (message) => `${message.title}: ${message.value ?? EMPTY_VALUE}`).join('\n');
        }

        await ctx.$replyWithMarkdown(message, messageExtra);
    }

    async onDebugCommand(ctx: MessageContext) {
        const { botInfo, from, chat } = ctx;
        const fullName = [from.first_name, from.last_name].join(' ');
        const userTag = from.username ? `@${from.username}` : EMPTY_VALUE;
        const appVersion = this.configService.get('npm_package_version');
        const message = [
            `\\# *bot*`,
            `\`version: ${appVersion}\``,
            `\`name: ${botInfo.first_name}\``,
            `\`username: @${botInfo.username}\``,
            `\`adminsCount: ${ADMINS_IDS.length}\``,
            `\`isProduction: ${this.isProd}\``,

            `\n\\# *chat*`,
            `\`id: ${chat.id}\``,
            `\`type: ${chat.type}\``,

            `\n\\# *user*`,
            `\`id: ${from.id}\``,
            `\`username: ${userTag}\``,
            `\`fullName: ${fullName}\``,
            `\`lang: ${from?.language_code || EMPTY_VALUE}\``,
            `\`isAdmin: ${ADMINS_IDS.includes(from.id)}\``,
        ];

        await ctx.replyWithMarkdownV2(message.join('\n'));
    }

    async onAudioMessage(ctx: AudioContext) {
        const isPrivateChat = ctx.chat.type === 'private';
        const isFromCurrentBot = ctx.botInfo.id === ctx.message.via_bot?.id;

        if (isPrivateChat && !isFromCurrentBot) {
            const message = ctx.$t('actions.save') + '?';
            const inlineKeyboard = Markup.inlineKeyboard([
                [
                    Markup.button.callback(ctx.$t('base.yes'), 'SAVE_AUDIO'),
                    Markup.button.callback(ctx.$t('base.no'), 'DISCARD_AUDIO'),
                ],
            ]);

            await ctx.$replyWithMarkdown(message, inlineKeyboard);
        }
    }

    async onCallbackQuery(ctx: CallbackQueryContext) {
        const queryKey = ctx.callbackQuery.data;
        const [key, payload] = queryKey.split(':');

        if (key === 'DELETE_MY_DATA') {
            await this.onDeleteUser(ctx);
        }

        if (ctx.isAdmin) {
            if (key === 'SAVE_AUDIO') {
                await this.onSaveAudio(ctx);
            }

            if (key === 'DISCARD_AUDIO') {
                await this.onDiscardAudio(ctx);
            }

            if (key === 'DELETE_AUDIO') {
                await this.onDeleteAudio(ctx, payload);
            }

            if (key === 'RESTORE_AUDIO') {
                await this.onRestoreAudio(ctx, payload);
            }
        }
    }

    private async onDeleteUser(ctx: CallbackQueryContext) {
        const messageAuthor = ctx.callbackQuery.message.reply_to_message.from;
        const actionAuthor = ctx.from;

        if (messageAuthor?.id === actionAuthor.id) {
            const isDeleted = await this.userService.deleteUser(ctx.from.id);
            const message = isDeleted ? ctx.$t('actions.deleted') : ctx.$t('base.not_found');

            await ctx.editMessageText(`\`${message}\``, { parse_mode: 'MarkdownV2' });
        } else {
            throw new TelegrafException(ctx.$t('errors.cannot_delete_other_user'));
        }
    }

    private async onSaveAudio(ctx: CallbackQueryContext) {
        const query = ctx.callbackQuery;
        const replyMessage = query.message.reply_to_message;
        const author = replyMessage.forward_from || replyMessage.from || ctx.botInfo;
        const audio = replyMessage.voice || replyMessage.audio;
        const audioURL = await ctx.telegram.getFileLink(audio.file_id);
        const authoredBy = await this.userService.createOrUpdateUser(getMappedUser(author));
        const createdBy = await this.userService.getUser(query.from.id);

        const audioData = replyMessage.voice
            ? this.getVoiceData({ author: authoredBy })
            : this.getAudioData({ audio: replyMessage.audio, author: authoredBy });

        const fileBuffer = await this.ffmpegService.getCleanAudio({
            url: audioURL.href,
            title: replyMessage.caption || audioData.title,
        });

        const { voice: newVoice } = await ctx.replyWithVoice({ source: fileBuffer });

        await this.audioService.createAudio({
            name: replyMessage.caption || audioData.title,
            content: fileBuffer,
            telegramMetadata: getMappedTelegramAudio(newVoice),
            authoredBy,
            createdBy,
        });

        await ctx.editMessageText(`\`${ctx.$t('actions.saved')}\``, { parse_mode: 'MarkdownV2' });
    }

    private getAudioData(data: GetAudioData) {
        const { audio, author } = data;
        const title = audio.title || `${AUDIO_DEFAULT_NAME_PREFIX}${author.username || author.userId}`;

        return {
            title: title.replace(' ', '_'),
        };
    }

    private getVoiceData(data: GetVoiceData) {
        const { author } = data;
        const title = `${AUDIO_DEFAULT_NAME_PREFIX}${author.username || author.userId}`;

        return {
            title: title.replace(' ', '_'),
        };
    }

    private async onDiscardAudio(ctx: CallbackQueryContext) {
        const message = ctx.$t('actions.discarded');

        await ctx.editMessageText(`\`${message}\``, { parse_mode: 'MarkdownV2' });
    }

    private async onDeleteAudio(ctx: CallbackQueryContext, audioId: string) {
        const user = await this.userService.getUser(ctx.from.id);
        const deletedAudio = await this.audioService.deleteAudio({ _id: audioId }, user);
        let message = ctx.$t('base.not_found');
        const messageExtra: ExtraEditMessageCaption = { parse_mode: 'MarkdownV2' };

        if (deletedAudio) {
            const messageInfo = this.getMessageInfo(ctx, deletedAudio);

            message = messageInfo.message;
            messageExtra.reply_markup = { inline_keyboard: messageInfo.inlineKeyboard };
        }

        await ctx.editMessageCaption(message, messageExtra);
    }

    private async onRestoreAudio(ctx: CallbackQueryContext, audioId: string) {
        const updatedAudio = await this.audioService.updateAudio({
            filter: { _id: audioId },
            update: { deletedAt: null, deletedBy: null },
        });
        let message = ctx.$t('base.not_found');
        const messageExtra: ExtraEditMessageCaption = { parse_mode: 'MarkdownV2' };

        if (updatedAudio) {
            const messageInfo = this.getMessageInfo(ctx, updatedAudio);

            message = messageInfo.message;
            messageExtra.reply_markup = { inline_keyboard: messageInfo.inlineKeyboard };
        }

        await ctx.editMessageCaption(message, messageExtra);
    }

    private getMessageInfo(ctx: Context, audio: AudioModel) {
        const inlineKeyboard: ReturnType<typeof Markup.button.callback>[] = [];
        const usedTimesText = ctx.$t('replies.used_times', { args: { count: audio.usedTimes } });
        const messageList = [
            [usedTimesText],
            [ctx.$t('base.creator'), audio.createdBy.displayName],
            [ctx.$t('base.deleter'), audio.deletedBy?.displayName || EMPTY_VALUE],
        ];

        if (audio.deletedAt) {
            inlineKeyboard.push(Markup.button.callback(ctx.$t('actions.restore'), `RESTORE_AUDIO:${audio.id}`));
        } else {
            inlineKeyboard.push(Markup.button.callback(ctx.$t('actions.delete'), `DELETE_AUDIO:${audio.id}`));
        }

        return {
            message: map(messageList, (message) => `\`${message.join(': ')}\``).join('\n'),
            inlineKeyboard: [inlineKeyboard],
        };
    }

    async onInlineQuery(ctx: InlineQueryContext) {
        const searchText = ctx.inlineQuery.query;
        const searchRegex = new RegExp(searchText, 'i');
        const rawAudios = await this.audioService.getAudiosList({
            filter: { deletedAt: null },
            options: { sort: { usedTimes: 'desc' } },
        });

        const audios = filter(rawAudios, (audio) => {
            const { name, authoredBy, createdBy } = audio;
            const arrayToSearch = [
                name,
                authoredBy.displayName,
                authoredBy.username,
                createdBy.displayName,
                createdBy.username,
            ];

            return some(arrayToSearch, (search) => search && searchRegex.test(search));
        });

        await ctx.answerInlineQuery(
            map(audios, (audio) => ({
                type: 'voice',
                id: audio.telegramMetadata.fileUniqueId,
                title: audio.name,
                voice_file_id: audio.telegramMetadata.fileId,
                voice_duration: audio.telegramMetadata.duration,
            })),
            {
                cache_time: this.isProd ? 300 : 0,
            },
        );
    }

    async onInlineQueryResultChosen(ctx: ChosenInlineResultContext) {
        const { from: user, result_id: fileUniqueId } = ctx.chosenInlineResult;

        await this.userService.createOrUpdateUser(getMappedUser(user));
        await this.audioService.updateAudio({
            filter: { 'telegramMetadata.fileUniqueId': fileUniqueId },
            update: { $inc: { usedTimes: 1 } },
        });
    }
}
