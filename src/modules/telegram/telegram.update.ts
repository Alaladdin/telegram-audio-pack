import { Logger, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { InjectBot, Update, Command, On, TelegrafException } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { I18nService } from 'nestjs-i18n';
import {
    AudioContext,
    CallbackQueryContext,
    Context,
    InlineQueryContext,
    ChosenInlineResultContext,
    MessageContext,
} from './interfaces';
import { TelegramLoggerInterceptor } from './interceptors';
import { AdminGuard, PrivateChatGuard } from './guards';
import { TelegramService } from '@/modules/telegram/telegram.service';
import { I18nTranslations } from '@/generated/localization.generated';
import { TelegrafExceptionFilter } from '@/modules/telegram/filters';
import { BOT_NAME } from './telegram.constants';
import { AudioService } from '@/modules/audio/audio.service';
import { noop } from '@utils';

@Update()
@UseInterceptors(TelegramLoggerInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class TelegramUpdate {
    private logger = new Logger('Telegram');

    constructor(
        @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
        private readonly i18n: I18nService<I18nTranslations>,
        private readonly audioService: AudioService,
        private readonly telegramService: TelegramService,
    ) {
        this.audioService.updateCaches();
        this.telegramService
            .setBotCommands(this.bot)
            .then(() => {
                this.logger.verbose('Commands updated');
            })
            .catch(() => {
                this.logger.error('Commands update error');
            });
    }

    @Command('start')
    async onStart(ctx: MessageContext) {
        await ctx.sendChatAction('typing');

        return this.telegramService.onStartCommand(ctx);
    }

    @Command('help')
    async onHelp(ctx: MessageContext) {
        await ctx.sendChatAction('typing');

        return this.telegramService.onHelpCommand(ctx);
    }

    @Command('top')
    async onTopCommand(ctx: MessageContext) {
        await ctx.sendChatAction('typing');

        return this.telegramService.onTopCommand(ctx);
    }

    @Command('list')
    async onListCommand(ctx: MessageContext) {
        await ctx.sendChatAction('typing');

        return this.telegramService.onListCommand(ctx);
    }

    @UseGuards(AdminGuard, PrivateChatGuard)
    @Command('get_backup')
    async onGetBackup(ctx: MessageContext) {
        await ctx.sendChatAction('upload_document');

        return this.telegramService.onGetBackupCommand(ctx);
    }

    @Command('stats')
    async onStats(ctx: MessageContext) {
        await ctx.sendChatAction('typing');

        return this.telegramService.onStatsCommand(ctx);
    }

    @Command('debug')
    async onDebug(ctx: MessageContext) {
        await ctx.sendChatAction('typing');

        return this.telegramService.onDebugCommand(ctx);
    }

    @On(['voice', 'audio'])
    async onAudio(ctx: AudioContext) {
        return this.telegramService.onAudioMessage(ctx);
    }

    @On('callback_query')
    async onCallbackQuery(ctx: CallbackQueryContext) {
        const queryKey = ctx.callbackQuery.data;

        if (!ctx.isAdmin && !queryKey.includes('LOAD_MORE_AUDIOS')) {
            throw new TelegrafException(ctx.$t('errors.not_admin'));
        }

        return this.telegramService
            .onCallbackQuery(ctx)
            .finally(() => {
                ctx.answerCbQuery();
            })
            .catch(noop);
    }

    @On('inline_query')
    async onInlineQuery(ctx: InlineQueryContext) {
        return this.telegramService.onInlineQuery(ctx);
    }

    @On('chosen_inline_result')
    async onInlineQueryResultChosen(ctx: ChosenInlineResultContext) {
        return this.telegramService.onInlineQueryResultChosen(ctx);
    }
}
