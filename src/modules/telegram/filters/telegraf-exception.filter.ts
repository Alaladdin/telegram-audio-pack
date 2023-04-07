import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TelegrafArgumentsHost } from 'nestjs-telegraf';
import { Context } from '../interfaces';
import { AnalyticsService } from '@/modules/analytics/analytics.service';

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter {
    private readonly analyticsService = new AnalyticsService();

    async catch(exception: Error, host: ArgumentsHost): Promise<void> {
        const telegrafHost = TelegrafArgumentsHost.create(host);
        const ctx = telegrafHost.getContext<Context>();
        const user = ctx.from;
        const errorMessage = ctx.$t('errors.base_error', { args: { message: exception.message } });

        this.analyticsService.reportCrash(exception, {
            user: user && {
                ...user,
                id: user.id.toString(),
                displayName: ctx.displayName,
                isAdmin: ctx.isAdmin,
            },
            extra: {
                updateType: ctx.updateType,
                chat: ctx.chat,
            },
        });

        if (ctx.updateType === 'message') {
            await ctx.$replyWithMDCode(errorMessage);
        }

        if (ctx.updateType === 'callback_query') {
            await ctx.answerCbQuery(errorMessage);
        }
    }
}
