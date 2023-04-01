import { Logger, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { InjectBot, Update, Command, On } from 'nestjs-telegraf';
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

    @Command('top')
    async onTopCommand(ctx: MessageContext) {
        return this.telegramService.onTopCommand(ctx);
    }

    @UseGuards(AdminGuard, PrivateChatGuard)
    @Command('list')
    async onListCommand(ctx: MessageContext) {
        return this.telegramService.onListCommand(ctx);
    }

    @Command('my_data')
    async onMyDataCommand(ctx: MessageContext) {
        return this.telegramService.onMyDataCommand(ctx);
    }

    @Command('debug')
    async onDebug(ctx: MessageContext) {
        return this.telegramService.onDebugCommand(ctx);
    }

    @UseGuards(AdminGuard)
    @On(['voice', 'audio'])
    async onAudio(ctx: AudioContext) {
        return this.telegramService.onAudioMessage(ctx);
    }

    @On('callback_query')
    async onCallbackQuery(ctx: CallbackQueryContext) {
        /* prettier-ignore */
        return this.telegramService
            .onCallbackQuery(ctx)
            .finally(() => {
                ctx.answerCbQuery();
            });
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
