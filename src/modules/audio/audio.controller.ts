import { Controller, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AudioService } from '@/modules/audio/audio.service';
import { AnalyticsService } from '@/modules/analytics/analytics.service';

@Controller('audio')
export class AudioController {
    private readonly logger = new Logger(AudioController.name);

    constructor(
        private readonly analyticsService: AnalyticsService, // prettier-ignore
        private readonly audioService: AudioService,
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    async updateCaches() {
        await this.audioService.updateCaches();
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteOldAudios() {
        const start = Date.now();
        const transaction = this.analyticsService.startTransaction({
            name: 'CLEAN_UP_AUDIOS',
            op: 'CRON',
        });

        this.logger.debug('Cleaning deleted audios');

        await this.audioService
            .cleanUpAudios()
            .then(({ deletedCount }) => {
                this.logger.verbose(`${deletedCount} audios cleaned up`);
                transaction.data = { deletedCount };
            })
            .catch((e) => {
                this.logger.error(e);
                this.analyticsService.reportCrash(e);
                transaction.data = { error: e };
            })
            .finally(() => {
                this.logger.debug(`Cleaning executed: ${Date.now() - start}ms`);
                transaction.finish();
            });
    }
}
