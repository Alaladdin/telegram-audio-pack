import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/localization.generated';
import { map } from '@utils';
import { Audio, Voice } from 'typegram';
import { Markup, Telegraf } from 'telegraf';
import {
    AudioContext,
    CallbackQueryContext,
    ChosenInlineResultContext,
    Context,
    MessageContext,
    UserData,
} from './interfaces';
import { ADMINS_IDS, BOT_COMMANDS_LIST } from './telegram.constants';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { HttpService } from '@nestjs/axios';
import { AudioEntity } from '@entities';
import { Readable } from 'stream';
import { FfmpegService } from '@/modules/ffmpeg/ffmpeg.service';
import { ConfigService } from '@nestjs/config';
import { formatDate } from '@utils';
import { UserService } from '@/modules/user/user.service';
import { EMPTY_VALUE } from '@constants';

@Injectable()
export class TelegramService {
    private isProd = true;

    constructor(
        @InjectModel(AudioEntity) private readonly audioRepository: ModelType<AudioEntity>,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly ffmpegService: FfmpegService,
        private readonly httpService: HttpService,
        private readonly i18n: I18nService<I18nTranslations>,
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
        const user = ctx.from;

        await this.userService.createOrUpdateUser({
            userId: user.id,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            displayName: ctx.displayName,
            lang: user.language_code,
        });

        await ctx.$replyWithMarkdown(message);
    }

    async onGetMyData(ctx: MessageContext) {
        const user = await this.userService.getUser(ctx.from.id);

        if (user) {
            const messageList: UserData[] = [
                { title: 'userId', value: user.userId },
                { title: 'firstName', value: user.firstName },
                { title: 'lastName', value: user.lastName },
                { title: 'displayName', value: user.displayName },
                { title: 'access', value: JSON.stringify(user.access, null, 4) },
                { title: 'updatedAt', value: formatDate(user.updatedAt) },
                { title: 'createdAt', value: formatDate(user.createdAt) },
            ];
            const message = map(messageList, (message) => `${message.title}: ${message.value || EMPTY_VALUE}`);

            await ctx.$replyWithMarkdown(message.join('\n'));
        } else {
            await ctx.$replyWithMarkdown('No data about you');
        }
    }

    async onDebugCommand(ctx: MessageContext) {
        const { botInfo, from, chat } = ctx;
        const fullName = [from.first_name, from.last_name].join(' ');
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
            `\`username: @${from.username || 'NO_TAG'}\``,
            `\`fullName: ${fullName}\``,
            `\`locale: ${from?.language_code || 'UNKNOWN'}\``,
            `\`isAdmin: ${ADMINS_IDS.includes(from.id)}\``,
        ];

        await ctx.replyWithMarkdownV2(message.join('\n'));
    }

    async onAudioMessage(ctx: AudioContext) {
        if (ctx.botInfo.id === ctx.message.via_bot?.id) return;

        const message = ctx.$t('actions.save') + '?';
        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback(ctx.$t('base.yes'), 'SAVE_AUDIO'),
                Markup.button.callback(ctx.$t('base.no'), 'DISCARD_AUDIO'),
            ],
        ]);

        await ctx.$replyWithMarkdown(message, keyboard);
    }

    async onCallbackQuery(ctx: CallbackQueryContext) {
        const queryKey = ctx.callbackQuery.data;

        if (queryKey === 'SAVE_AUDIO') {
            return this.onSaveAudio(ctx);
        }

        if (queryKey === 'DISCARD_AUDIO') {
            return this.onDiscardAudio(ctx);
        }
    }

    private async onSaveAudio(ctx: CallbackQueryContext) {
        const query = ctx.callbackQuery;
        const replyMessage = query.message.reply_to_message;
        const author = replyMessage.forward_from || replyMessage.from || ctx.botInfo;
        const audio = replyMessage.voice || replyMessage.audio;
        const audioURL = await ctx.telegram.getFileLink(audio.file_id);
        const audioFile = await this.httpService.axiosRef<Readable>({
            url: audioURL.href,
            responseType: 'stream',
        });

        const audioData = replyMessage.voice
            ? this.getVoiceData(replyMessage.voice)
            : this.getAudioData(replyMessage.audio);

        const fileBuffer = await this.ffmpegService.getCleanAudio({
            readable: audioFile.data,
            title: replyMessage.caption || audioData.title,
        });

        const { voice: newVoice } = await ctx.replyWithVoice({ source: fileBuffer });

        await this.audioRepository.create({
            telegramMetadata: {
                fileId: newVoice.file_id,
                fileUniqueId: newVoice.file_unique_id,
                size: newVoice.file_size,
                mimeType: newVoice.mime_type,
                duration: newVoice.duration,
            },
            content: fileBuffer,
            name: replyMessage.caption || audioData.title,
            authoredBy: {
                id: author.id,
                username: author.username,
            },
            createdBy: {
                id: query.from.id,
                username: query.from.username,
            },
        });

        return ctx.editMessageText(`\`${ctx.$t('actions.saved')}\``, { parse_mode: 'MarkdownV2' });
    }

    private getAudioData(audio: Audio) {
        return {
            title: audio.title || audio.file_name || audio.file_id,
        };
    }
    private getVoiceData(voice: Voice) {
        return {
            title: voice.file_id,
        };
    }

    private async onDiscardAudio(ctx: CallbackQueryContext) {
        const message = ctx.$t('actions.discarded');

        return ctx.editMessageText(`\`${message}\``, { parse_mode: 'MarkdownV2' });
    }

    async onInlineQuery(ctx: Context) {
        const searchText = ctx.inlineQuery?.query;
        const audios = await this.audioRepository
            .find({
                name: { $regex: searchText, $options: 'i' },
                // authoredBy: { $regex: searchText, $options: 'i' },
                // createdBy: { $regex: searchText, $options: 'i' },
                deletedAt: null,
            })
            .sort('-usedTimes')
            .lean();

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

    async updateStats(ctx: ChosenInlineResultContext) {
        const { from: user, result_id: fileUniqueId } = ctx.chosenInlineResult;

        await this.userService.createOrUpdateUser({
            userId: user.id,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            displayName: user.first_name,
            lang: user.language_code,
        });

        await this.audioRepository.findOneAndUpdate(
            { 'telegramMetadata.fileUniqueId': fileUniqueId },
            { $inc: { usedTimes: 1 } },
        );
    }
}
