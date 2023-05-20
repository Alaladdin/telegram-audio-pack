import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { AudioEntity } from './entities';
import { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { getSubtractedDate, ms, some, debounce, map } from '@utils';
import { AudioModel } from '@/modules/audio/audio.model';
import {
    AudioModelCached,
    GetAudioParams,
    GetAudiosListParams,
    UpdateAudioParams,
} from '@/modules/audio/audio.interfaces';
import { CreateAudioDto } from '@/modules/audio/dto';
import { AUDIOS_LIST_CACHE_KEY, NO_CLEAR_CACHE_ON_UPDATE_KEYS } from '@/modules/audio/audio.constants';
import { CacheService } from '@/modules/cache/cache.service';
import { Nullable } from '@types';
import { AnalyticsService } from '@/modules/analytics/analytics.service';

@Injectable()
export class AudioService {
    private readonly logger = new Logger(AudioService.name);

    constructor(
        @InjectModel(AudioEntity) private readonly audioRepository: ReturnModelType<typeof AudioEntity>,
        private readonly analyticsService: AnalyticsService,
        private readonly cacheService: CacheService,
    ) {}

    async createAudio(audio: CreateAudioDto): Promise<AudioModel> {
        const newAudio = await this.audioRepository.create(audio);

        await this.updateCaches();

        return newAudio.toObject();
    }

    async updateAudio(params: UpdateAudioParams): Promise<Nullable<AudioModel>> {
        const updateString = JSON.stringify(params.update);
        const needToClearCache = some(NO_CLEAR_CACHE_ON_UPDATE_KEYS, (key) => !updateString.includes(key));

        if (needToClearCache) {
            await this.updateCaches();
        }

        return this.audioRepository.findOneAndUpdate(params.filter, params.update, { new: true }).lean();
    }

    async getAudio(params: GetAudioParams = {}): Promise<Nullable<AudioModel>> {
        return this.audioRepository
            .findOne(params.filter)
            .select(params.select || {})
            .lean();
    }

    async getAudiosList(params: GetAudiosListParams = {}): Promise<AudioModel[]> {
        const cachedValue = await this.cacheService.get<AudioModelCached[]>(AUDIOS_LIST_CACHE_KEY);

        if (!cachedValue) {
            const audiosList: AudioModel[] = await this.audioRepository
                .find(params.filter || {})
                .limit(params.limit || 0)
                .select(params.select || {})
                .lean();

            await this.cacheService.set(AUDIOS_LIST_CACHE_KEY, audiosList);

            return audiosList;
        }

        // todo fix this
        return map(cachedValue, (audio) => ({
            ...audio,
            content: Buffer.from(audio.content),
        }));
    }

    async updateCaches() {
        debounce(this._updateCaches.bind(this), ms('1min'), { leading: true })();
    }

    private async _updateCaches() {
        const start = Date.now();
        const transaction = this.analyticsService.startTransaction({
            name: 'UPDATE_CACHES',
            op: 'CRON',
        });

        this.logger.debug('Updating caches');

        this.audioRepository
            .find({})
            .then((audiosList) => {
                return this.cacheService.set(AUDIOS_LIST_CACHE_KEY, audiosList);
            })
            .finally(() => {
                this.logger.debug(`Caches updated: ${Date.now() - start}ms`);
                transaction.finish();
            });
    }

    async cleanUpAudios() {
        const filter = { deletedAt: { $lte: getSubtractedDate(1, 'day') } };

        return this.audioRepository.deleteMany(filter, { lean: true });
    }
}
