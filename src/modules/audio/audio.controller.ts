import { Controller, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AudioService } from '@/modules/audio/audio.service';

@Controller('audio')
export class AudioController {
    private readonly logger = new Logger(AudioController.name);

    constructor(private readonly audioService: AudioService) {}

    @Cron(CronExpression.EVERY_HOUR)
    async updateCaches() {
        const start = Date.now();

        this.logger.debug('Updating caches');

        await this.audioService
            .updateCaches()
            .then(() => {
                this.logger.debug(`Caches updated: ${Date.now() - start}ms`);
            })
            .catch((e) => {
                this.logger.error(e);
            });
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteOldAudios() {
        const start = Date.now();

        this.logger.debug('Cleaning deleted audios');

        await this.audioService
            .cleanUpAudios()
            .then(({ deletedCount }) => {
                this.logger.verbose(`${deletedCount} audios cleaned up`);
            })
            .catch((e) => {
                this.logger.error(e);
            })
            .finally(() => {
                this.logger.debug(`Cleaning executed: ${Date.now() - start}ms`);
            });
    }
}
