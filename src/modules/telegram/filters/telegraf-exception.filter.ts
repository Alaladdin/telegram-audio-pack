import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TelegrafArgumentsHost } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter {
    async catch(exception: Error, host: ArgumentsHost): Promise<void> {
        const telegrafHost = TelegrafArgumentsHost.create(host);
        const ctx = telegrafHost.getContext<Context>();
        const errorMessage = ctx.$t('errors.base_error', { args: { message: exception.message } });

        await ctx.replyWithMarkdownV2(`\`${errorMessage}\``);
    }
}
