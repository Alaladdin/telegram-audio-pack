import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { TelegrafArgumentsHost } from 'nestjs-telegraf';
import { Context } from '../interfaces';

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter {
    private logger = new Logger(TelegrafExceptionFilter.name);

    async catch(exception: Error, host: ArgumentsHost): Promise<void> {
        const telegrafHost = TelegrafArgumentsHost.create(host);
        const ctx = telegrafHost.getContext<Context>();
        const updateType = ctx.updateType;
        const errorMessage = ctx.$t('errors.base_error', { args: { message: exception.message } });

        this.logger.error(`${updateType}: ${errorMessage}`);

        if (updateType === 'message') {
            await ctx.$replyWithMDCode(errorMessage);
        }

        if (updateType === 'callback_query') {
            await ctx.answerCbQuery(errorMessage);
        }
    }
}
