import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { TransactionContext, CaptureContext } from '@sentry/types';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    startTransaction(ctx: TransactionContext) {
        this.logger.debug(`[TRANSACTION]: ${ctx.op} - ${ctx.name}`);

        return Sentry.startTransaction(ctx);
    }

    reportCrash(exception: any, ctx?: CaptureContext) {
        this.logger.error(`[EXCEPTION]: ${exception}`);

        return Sentry.captureException(exception, ctx);
    }
}
