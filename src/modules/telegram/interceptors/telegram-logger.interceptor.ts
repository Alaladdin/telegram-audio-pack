import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { UniversalContext } from '@/modules/telegram/interfaces';
import { getDisplayName, getMappedSentryUser } from '@/modules/telegram/utils';
import { pick } from 'lodash';
import { AnalyticsService } from '@/modules/analytics/analytics.service';

@Injectable()
export class TelegramLoggerInterceptor implements NestInterceptor {
    private readonly logger = new Logger(TelegramLoggerInterceptor.name);
    private readonly analyticsService = new AnalyticsService();

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = Date.now();
        const telegrafExecutionContext = TelegrafExecutionContext.create(context);
        const ctx = telegrafExecutionContext.getContext<UniversalContext>();
        const transaction = this.analyticsService.startTransaction({
            name: ctx.message?.text || ctx.callbackQuery?.data || ctx.inlineQuery?.query || ctx.updateType,
            op: ctx.updateType,
            data: {
                ...pick(ctx, ['chat', 'message', 'updateType', 'callbackQuery', 'inlineQuery', 'chosenInlineResult']),
                user: getMappedSentryUser(ctx, ctx.from),
            },
        });

        return next.handle().pipe(
            tap(() => {
                const end = Date.now() - start;
                const messageList = [];

                if (ctx.chat && 'title' in ctx.chat && ctx.chat.title) {
                    messageList.push(`chat: ${ctx.chat?.title}`);
                }

                if (ctx.chat?.id) messageList.push(`chatId: ${ctx.chat.id}`);

                messageList.push(`displayName: ${getDisplayName(ctx.from)}`);

                if (ctx.from?.username) messageList.push(`@${ctx.from.username}`);
                if (ctx.message?.text) messageList.push(ctx.message.text);
                if (ctx.inlineQuery) messageList.push(ctx.inlineQuery.query);
                if (ctx.callbackQuery) messageList.push(ctx.callbackQuery.data);

                messageList.push(`${end}ms`);

                this.logger.verbose(messageList.join(' // '));

                transaction.finish();
            }),
        );
    }
}
