import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { TelegrafArgumentsHost } from 'nestjs-telegraf';
import { Context } from '../interfaces';

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter {
    private logger = new Logger(TelegrafExceptionFilter.name);

    async catch(exception: Error, host: ArgumentsHost): Promise<void> {
        const telegrafHost = TelegrafArgumentsHost.create(host);
        const ctx = telegrafHost.getContext<Context>();
        const errorMessage = ctx.$t('errors.base_error', { args: { message: exception.message } });

        this.logger.error(errorMessage);
        await ctx.reply(errorMessage).catch(this.logger.error);
    }
}
