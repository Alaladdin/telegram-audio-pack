import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { chain } from 'lodash';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { Context } from '@/modules/telegram/interfaces';

type LogOption = { title: string; value?: string | number | boolean } | { valueGetter: () => string };

@Injectable()
export class TelegramLoggerInterceptor implements NestInterceptor {
    private readonly logger = new Logger('Telegram');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = Date.now();
        const telegrafExecutionContext = TelegrafExecutionContext.create(context);
        const ctx = telegrafExecutionContext.getContext<Context>();

        return next.handle().pipe(
            tap(() => {
                const end = Date.now() - start;
                const logOptions: LogOption[] = [
                    { valueGetter: () => (ctx.chat && 'title' in ctx.chat ? ctx.chat.title : '') },
                    { valueGetter: () => ctx.displayName },
                    { title: 'chatId', value: ctx.chat?.id },
                    { valueGetter: () => `@${ctx.from?.username}` },
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
            }),
        );
    }
}
