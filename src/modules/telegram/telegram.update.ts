import { Logger, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { InjectBot, Update, Command, On } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { AudioContext, CallbackQueryContext, ChosenInlineResultContext, Context, MessageContext } from './interfaces';
import { TelegramLoggerInterceptor } from './interceptors';
import { AdminGuard } from './guards';
import { TelegramService } from '@/modules/telegram/telegram.service';
import { BOT_NAME } from './telegram.constants';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/localization.generated';
import { TelegrafExceptionFilter } from '@/modules/telegram/filters';

@Update()
@UseInterceptors(TelegramLoggerInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class TelegramUpdate {
    private logger = new Logger('Telegram');

    constructor(
        @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
        private readonly i18n: I18nService<I18nTranslations>,
        private readonly telegramService: TelegramService,
    ) {
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
        return this.telegramService.onStartCommand(ctx);
    }

    @Command('my_data')
    async onGetMyData(ctx: MessageContext) {
        return this.telegramService.onGetMyData(ctx);
    }

    @Command('debug')
    async onDebug(ctx: MessageContext) {
        return this.telegramService.onDebugCommand(ctx);
    }

    @On(['voice', 'audio'])
    async onAudio(ctx: AudioContext) {
        return this.telegramService.onAudioMessage(ctx);
    }

    @UseGuards(AdminGuard)
    @On('callback_query')
    async onCallbackQuery(ctx: CallbackQueryContext) {
        return this.telegramService
            .onCallbackQuery(ctx)
            .then(() => {
                ctx.answerCbQuery();
            })
            .catch((err) => {
                throw err;
            });
    }

    @On('inline_query')
    async onInlineQuery(ctx: Context) {
        return this.telegramService.onInlineQuery(ctx);
    }

    @On('chosen_inline_result')
    async onInlineQueryResultChosen(ctx: ChosenInlineResultContext) {
        return this.telegramService.updateStats(ctx);
    }
}
