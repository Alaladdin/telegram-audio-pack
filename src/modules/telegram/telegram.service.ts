import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { I18nTranslations } from '@/generated/localization.generated';
import { chain, map, orderBy, formatDate, sleep, getZip, each, reduce } from '@utils';
import { Markup, Telegraf } from 'telegraf';
import {
    AudioContext,
    CallbackQueryContext,
    ChosenInlineResultContext,
    Context,
    InlineQueryContext,
    MessageContext,
    SceneContext,
} from './interfaces';
import {
    ADMINS_IDS,
    BACKUP_FILE_NAME,
    BOT_COMMANDS_LIST,
    DATABASE_FILE_NAME,
    INLINE_QUERY_LIMIT,
    RENAME_AUDIO_SCENE_ID,
    TOP_AUDIOS_LIMIT,
} from './telegram.constants';
import { FfmpegService } from '@/modules/ffmpeg/ffmpeg.service';
import { EMPTY_VALUE } from '@constants';
import { AudioService } from '@/modules/audio/audio.service';
import { AudioModel } from '@/modules/audio/audio.model';
import { getEscapedMessage, getMappedAudio } from './utils';
import { ExtraEditMessageCaption } from 'telegraf/typings/telegram-types';
import { InlineQueryResultCachedVoice } from 'typegram/inline';

@Injectable()
export class TelegramService {
    private readonly isProd: boolean = true;

    constructor(
        private readonly configService: ConfigService,
        private readonly i18n: I18nService<I18nTranslations>,
        private readonly httpService: HttpService,
        private readonly audioService: AudioService,
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
        const message = ctx.$t('replies.greeting', { args: { name: ctx.displayName } });

        await ctx.$replyWithMDCode(message);
    }

    async onHelpCommand(ctx: Context) {
        const message = [`\`- Использование бота: введите\` \`@${ctx.me}\` \`в любом чате\``];

        if (ctx.isAdmin) {
            message.push(
                '\n*# Добавление новых аудиозаписей*',
                '`- Можно отправить боту как файл, так и переслать уже готовый войс/аудиофайл из телеграма`',
                '`- Чтобы установить название аудио, нужно при отправке, указать его в сообщении`',
                '`! Есть проблема с длинными mp3 файлами, они обрезаются по какой-то причине при сохранении`',
                '`! Протестировано с .ogg/.mp3`',

                '\n*# Удаление/восстановление аудиозаписей*',
                '`- Управление через команду /manage`',
                '`- Удаляются не сразу, а по прошествии 24 часов. В это время можно восстановить файл`',
                '`- Помеченные для удаления аудиозаписи нельзя использовать для отправки`',
            );
        }

        await ctx.$replyWithMD(message.join('\n'));
    }

    async onTopCommand(ctx: MessageContext) {
        const rawAudiosList = await this.audioService.getAudiosList();
        const audiosList = chain(rawAudiosList)
            .reject('deletedAt')
            .orderBy(['usedTimes'], ['desc'])
            .take(TOP_AUDIOS_LIMIT)
            .value();

        if (audiosList.length) {
            await ctx.$sendMessageWithMD(ctx.$t('replies.top_audios', { args: { count: TOP_AUDIOS_LIMIT } }));

            for await (const audio of audiosList) {
                const message = ctx.$t('replies.used_times', { args: { count: audio.usedTimes } });

                await ctx.sendChatAction('upload_voice');
                await ctx.sendAudio(
                    {
                        filename: audio.name,
                        source: audio.content,
                    },
                    {
                        title: audio.name,
                        caption: `\`${message}\``,
                        parse_mode: 'MarkdownV2',
                        duration: audio.voice.duration,
                        disable_notification: true,
                    },
                );
            }
        } else {
            await ctx.$sendMessageWithMD('No audios');
        }
    }

    async onManageCommand(ctx: MessageContext) {
        const rawAudiosList = await this.audioService.getAudiosList();
        const audiosList = orderBy(rawAudiosList, ['createdAt'], ['desc']);

        if (audiosList.length) {
            await ctx.$sendMessageWithMD(ctx.$t('replies.audios_list'));

            for await (const audio of audiosList) {
                const messageInfo = this.getAudioForListInfo(ctx, audio);

                await ctx.sendChatAction('upload_document');
                await ctx.sendAudio(
                    {
                        filename: audio.name,
                        source: audio.content,
                    },
                    {
                        title: audio.name,
                        caption: messageInfo.message,
                        reply_markup: { inline_keyboard: messageInfo.inlineKeyboard },
                        duration: audio.voice.duration,
                        parse_mode: 'MarkdownV2',
                        disable_notification: true,
                    },
                );

                await sleep(1);
            }
        } else {
            await ctx.$sendMessageWithMD('No audios');
        }
    }

    async onGetBackupCommand(ctx: MessageContext) {
        const audiosList = await this.audioService.getAudiosList();

        if (audiosList.length) {
            const zip = getZip();
            const message = ctx.$t('replies.data_may_be_not_actual');

            zip.addFile(DATABASE_FILE_NAME, Buffer.from(JSON.stringify(audiosList)));

            each(audiosList, (audio) => {
                zip.addFile(`${audio.name}.ogg`, audio.content);
            });

            await ctx.sendDocument(
                {
                    filename: BACKUP_FILE_NAME,
                    source: zip.toBuffer(),
                },
                {
                    caption: getEscapedMessage(`\`${message}\``),
                    parse_mode: 'MarkdownV2',
                },
            );
        } else {
            await ctx.$replyWithMDCode(ctx.$t('base.not_found'));
        }
    }

    async onStatsCommand(ctx: MessageContext) {
        const audiosList = await this.audioService.getAudiosList();
        const usedTimes = reduce(audiosList, (sum, audio) => sum + audio.usedTimes, 0);
        const message = [
            `${ctx.$t('replies.audios_count', { args: { count: audiosList.length } })}`,
            `${ctx.$t('replies.used_times', { args: { count: usedTimes } })}`,
        ];

        await ctx.$replyWithMDCode(message.join('\n'));
    }

    async onDebugCommand(ctx: MessageContext) {
        const { botInfo, from, chat } = ctx;
        const fullName = [from.first_name, from.last_name].join(' ');
        const userTag = from.username ? `@${from.username}` : EMPTY_VALUE;
        const appVersion = this.configService.get('npm_package_version');
        const message = [
            '*# bot*',
            `\`version: ${appVersion}\``,
            `\`name: ${botInfo.first_name}\``,
            `\`username: @${botInfo.username}\``,
            `\`adminsCount: ${ADMINS_IDS.length}\``,
            `\`isProduction: ${this.isProd}\``,

            '\n*# chat*',
            `\`id: ${chat.id}\``,
            `\`title: ${'title' in chat ? chat.title : chat.first_name}\``,
            `\`type: ${chat.type}\``,

            '\n*# user*',
            `\`id: ${from.id}\``,
            `\`username: ${userTag}\``,
            `\`fullName: ${fullName}\``,
            `\`lang: ${from?.language_code || EMPTY_VALUE}\``,
            `\`isAdmin: ${ctx.isAdmin}\``,
        ];

        await ctx.$replyWithMD(message.join('\n'));
    }

    async onAudioMessage(ctx: AudioContext) {
        const isFromCurrentBot = ctx.botInfo.id === ctx.message.via_bot?.id;

        if (!isFromCurrentBot) {
            const message = ctx.$t('actions.save') + '?';
            const inlineKeyboard = Markup.inlineKeyboard([
                [
                    Markup.button.callback(ctx.$t('base.yes'), 'SAVE_AUDIO'),
                    Markup.button.callback(ctx.$t('base.no'), 'DISCARD_AUDIO'),
                ],
            ]);

            await ctx.$replyWithMD(message, inlineKeyboard);
        }
    }

    async onCallbackQuery(ctx: CallbackQueryContext) {
        const queryKey = ctx.callbackQuery.data;
        const [key, payload] = queryKey.split(':');

        if (key === 'SAVE_AUDIO') {
            await this.onSaveAudio(ctx);
        }

        if (key === 'DISCARD_AUDIO') {
            await this.onDiscardAudio(ctx);
        }

        if (key === 'DELETE_AUDIO') {
            await this.onDeleteAudio(ctx, payload);
        }

        if (key === 'RENAME_AUDIO') {
            // @ts-ignore
            await this.onRenameAudio(ctx, payload);
        }

        if (key === 'RESTORE_AUDIO') {
            await this.onRestoreAudio(ctx, payload);
        }
    }

    private async onSaveAudio(ctx: CallbackQueryContext) {
        const query = ctx.callbackQuery;
        const replyMessage = query.message.reply_to_message;
        const audio = replyMessage.voice || replyMessage.audio;
        const audioUrl = await ctx.telegram.getFileLink(audio.file_id);
        const audioTitle = replyMessage.caption || `${Date.now()}`;
        const fileBuffer = await this.ffmpegService.getCleanAudio({
            url: audioUrl.href,
            title: audioTitle,
        });

        const replyVoice = await ctx.replyWithVoice(
            { source: fileBuffer },
            {
                parse_mode: 'MarkdownV2',
                caption: getEscapedMessage(`\`${audioTitle}\``),
            },
        );

        await this.audioService.createAudio({
            name: audioTitle,
            content: fileBuffer,
            voice: getMappedAudio(replyVoice.voice),
        });

        await ctx.editMessageText(`\`${ctx.$t('actions.saved')}\``, { parse_mode: 'MarkdownV2' });
    }

    private async onDiscardAudio(ctx: CallbackQueryContext) {
        const message = ctx.$t('actions.discarded');

        await ctx.editMessageText(`\`${message}\``, { parse_mode: 'MarkdownV2' });
    }

    private async onDeleteAudio(ctx: CallbackQueryContext, audioId: string) {
        const deletedAudio = await this.audioService.updateAudio({
            filter: { _id: audioId },
            update: { deletedAt: Date.now() },
        });
        let message = ctx.$t('base.not_found');
        const messageExtra: ExtraEditMessageCaption = { parse_mode: 'MarkdownV2' };

        if (deletedAudio) {
            const messageInfo = this.getAudioForListInfo(ctx, deletedAudio);

            message = messageInfo.message;
            messageExtra.reply_markup = { inline_keyboard: messageInfo.inlineKeyboard };
        }

        await ctx.editMessageCaption(message, messageExtra);
    }

    private async onRenameAudio(ctx: SceneContext, audioId: string) {
        await ctx.scene.enter(RENAME_AUDIO_SCENE_ID, { audioId });
    }

    private async onRestoreAudio(ctx: CallbackQueryContext, audioId: string) {
        const updatedAudio = await this.audioService.updateAudio({
            filter: { _id: audioId },
            update: { deletedAt: null },
        });
        let message = ctx.$t('base.not_found');
        const messageExtra: ExtraEditMessageCaption = { parse_mode: 'MarkdownV2' };

        if (updatedAudio) {
            const messageInfo = this.getAudioForListInfo(ctx, updatedAudio);

            message = messageInfo.message;
            messageExtra.reply_markup = { inline_keyboard: messageInfo.inlineKeyboard };
        }

        await ctx.editMessageCaption(message, messageExtra);
    }

    private getAudioForListInfo(ctx: Context, audio: AudioModel) {
        const inlineKeyboard: ReturnType<typeof Markup.button.callback>[] = [];
        const usedTimesText = ctx.$t('replies.used_times', { args: { count: audio.usedTimes } });
        const deletedAtDate = audio.deletedAt ? formatDate(audio.deletedAt) : EMPTY_VALUE;
        const deletedAtText = ctx.$t('base.deletedAt', { args: { date: deletedAtDate } });
        const message = map([usedTimesText, deletedAtText], (message) => `\`${message}\``).join('\n');

        if (audio.deletedAt) {
            inlineKeyboard.push(Markup.button.callback(ctx.$t('actions.restore'), `RESTORE_AUDIO:${audio._id}`));
        } else {
            inlineKeyboard.push(Markup.button.callback(ctx.$t('actions.rename'), `RENAME_AUDIO:${audio._id}`));
            inlineKeyboard.push(Markup.button.callback(ctx.$t('actions.delete'), `DELETE_AUDIO:${audio._id}`));
        }

        return {
            message: getEscapedMessage(message),
            inlineKeyboard: [inlineKeyboard],
        };
    }

    async onInlineQuery(ctx: InlineQueryContext) {
        const searchText = ctx.inlineQuery.query;
        const rawAudios = await this.audioService.getAudiosList();

        const audios = chain(rawAudios)
            .reject((audio) => {
                const audioSearchName = audio.name.toLowerCase();

                return !!audio.deletedAt || !audioSearchName.includes(searchText);
            })
            .orderBy(['usedTimes'], ['desc'])
            .take(INLINE_QUERY_LIMIT)
            .map<InlineQueryResultCachedVoice>((audio) => ({
                type: 'voice',
                id: audio.voice.fileUniqueId,
                title: audio.name,
                voice_file_id: audio.voice.fileId,
                voice_duration: audio.voice.duration,
            }))
            .value();

        await ctx.answerInlineQuery(audios, { cache_time: this.isProd ? 300 : 0 });
    }

    async onInlineQueryResultChosen(ctx: ChosenInlineResultContext) {
        const { result_id: fileUniqueId } = ctx.chosenInlineResult;

        await this.audioService.updateAudio({
            filter: { 'voice.fileUniqueId': fileUniqueId },
            update: { $inc: { usedTimes: 1 } },
        });
    }
}
