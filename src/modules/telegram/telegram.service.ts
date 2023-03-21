import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/localization.generated';
import { map } from 'lodash';
import { Audio, Voice } from 'typegram';
import { Markup, Telegraf } from 'telegraf';
import { AudioContext, CallbackQueryContext, Context, SaveAudioFile } from './interfaces';
import { ADMINS_IDS, BOT_COMMANDS_LIST } from './telegram.constants';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { HttpService } from '@nestjs/axios';
import { AudioEntity, UserEntity } from '@entities';
import { Readable } from 'stream';
import { FfmpegService } from '@/modules/ffmpeg/ffmpeg.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
    private isProd = true;

    constructor(
        @InjectModel(AudioEntity) private readonly audioRepository: ModelType<AudioEntity>,
        @InjectModel(UserEntity) private readonly userRepository: ModelType<UserEntity>,
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

    async onStartCommand(ctx: Context) {
        const message = ctx.$t('replies.greeting', { args: { name: ctx.username } });

        await ctx.replyWithMarkdownV2(`\`${message}\``);
    }

    async onDebugCommand(ctx: Context) {
        const { botInfo, from, chat } = ctx;
        const fullName = [from?.first_name, from?.last_name].join(' ') || 'UNKNOWN';
        const appVersion = this.configService.get('npm_package_version');
        const message = [
            `\\# *bot*`,
            `\`version: ${appVersion}\``,
            `\`name: ${botInfo.first_name}\``,
            `\`username: @${botInfo.username}\``,
            `\`adminsCount: ${ADMINS_IDS.length}\``,
            `\`isProduction: ${this.isProd}\``,

            `\n\\# *chat*`,
            `\`id: ${chat?.id}\``,
            `\`type: ${chat?.type}\``,

            `\n\\# *user*`,
            `\`id: ${from?.id}\``,
            `\`username: @${from?.username}\``,
            `\`fullName: ${fullName}\``,
            `\`locale: ${from?.language_code || 'UNKNOWN'}\``,
            `\`isAdmin: ${ADMINS_IDS.includes(<number>from?.id)}\``,
        ];

        await ctx.replyWithMarkdownV2(message.join('\n'));
    }

    async onAudioMessage(ctx: AudioContext) {
        if (ctx.botInfo.id === ctx.message.via_bot?.id) return;

        const message = ctx.$t('base.save') + '?';
        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback(ctx.$t('base.yes'), 'SAVE_AUDIO'),
                Markup.button.callback(ctx.$t('base.no'), 'DISCARD_AUDIO'),
            ],
        ]);

        await ctx.replyWithMarkdownV2(`\`${message}\``, keyboard);
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

        console.log(audioData, replyMessage.voice, replyMessage.audio);

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

        return ctx.editMessageText(`\`${ctx.$t('base.saved')}\``, { parse_mode: 'MarkdownV2' });
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
        const message = ctx.$t('base.discarded');

        return ctx.editMessageText(`\`${message}\``, { parse_mode: 'MarkdownV2' });
    }

    async onInlineQuery(ctx: Context) {
        const queryData = ctx.inlineQuery;
        const audios = await this.audioRepository
            .find({
                name: { $regex: queryData?.query, $options: 'i' },
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
                cache_time: this.isProd ? 0 : 300,
            },
        );
    }
}
