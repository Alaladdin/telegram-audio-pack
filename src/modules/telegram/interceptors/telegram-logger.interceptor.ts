import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { chain } from '@utils';
import * as Sentry from '@sentry/node';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { Context } from '@/modules/telegram/interfaces';
import { getDisplayName, getMappedSentryUser } from '@/modules/telegram/utils';
import { pick } from 'lodash';

type LogOption = { title: string; value?: string | number | boolean } | { valueGetter: () => string };

@Injectable()
export class TelegramLoggerInterceptor implements NestInterceptor {
    private readonly logger = new Logger(TelegramLoggerInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = Date.now();
        const telegrafExecutionContext = TelegrafExecutionContext.create(context);
        const ctx = telegrafExecutionContext.getContext<Context>();
        const transaction = Sentry.startTransaction({
            name: ctx.updateType,
            op: ctx.updateType,
            data: {
                ...pick(ctx, ['chat', 'message', 'updateType', 'callbackQuery', 'inlineQuery']),
                user: getMappedSentryUser(ctx, ctx.from),
            },
        });

        return next.handle().pipe(
            tap(() => {
                const end = Date.now() - start;
                const logOptions: LogOption[] = [
                    { valueGetter: () => (ctx.chat && 'title' in ctx.chat ? ctx.chat.title : '') },
                    { valueGetter: () => getDisplayName(ctx.from) },
                    { title: 'chatId', value: ctx.chat?.id },
                    { valueGetter: () => `@${ctx.from?.username}` },
                    { valueGetter: () => (ctx.message && 'text' in ctx.message ? ctx.message.text : '') },
                    { title: 'inlineQuery', value: ctx.inlineQuery?.query },
                    {
                        title: 'callbackQuery',
                        value: ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '',
                    },
                    { valueGetter: () => `${end}ms` },
                ];

                const message = chain(logOptions)
                    .filter((option) => {
                        if ('valueGetter' in option) return true;

                        return !!option.value;
                    })
                    .map((option) => {
                        if ('valueGetter' in option) return option.valueGetter();

                        return `${option.title}: ${option.value}`;
                    })
                    .compact()
                    .join(' — ');

                this.logger.verbose(message);

                transaction.finish();
            }),
        );
    }
}
