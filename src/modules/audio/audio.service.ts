import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { AudioEntity } from './entities';
import { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { getSubtractedDate, some } from '@utils';
import { AudioModel } from '@/modules/audio/audio.model';
import { GetAudioParams, GetAudiosListParams, UpdateAudioParams } from '@/modules/audio/audio.interfaces';
import { CreateAudioDto } from '@/modules/audio/dto';
import { AUDIOS_LIST_CACHE_KEY, CACHE_PREFIX, NO_CLEAR_CACHE_ON_UPDATE_KEYS } from '@/modules/audio/audio.constants';
import { CacheService } from '@/modules/cache/cache.service';

@Injectable()
export class AudioService {
    private readonly logger = new Logger(AudioService.name);
    private isUpdatingCaches = false;

    constructor(
        @InjectModel(AudioEntity) private readonly audioRepository: ReturnModelType<typeof AudioEntity>,
        private cacheService: CacheService,
    ) {}

    async createAudio(audio: CreateAudioDto): Promise<AudioModel> {
        const newAudio = await this.audioRepository.create(audio);

        await this.updateCaches();

        return newAudio.toObject();
    }

    async updateAudio(params: UpdateAudioParams): Promise<AudioModel> {
        const updateString = JSON.stringify(params.update);
        const needToClearCache = some(NO_CLEAR_CACHE_ON_UPDATE_KEYS, (key) => !updateString.includes(key));

        if (needToClearCache) {
            await this.updateCaches();
        }

        return this.audioRepository.findOneAndUpdate(params.filter, params.update, { new: true }).lean();
    }

    async getAudio(params: GetAudioParams = {}): Promise<AudioModel> {
        const cacheKey = [CACHE_PREFIX, JSON.stringify(params)].join('');
        const cachedValue = await this.cacheService.get<AudioModel>(cacheKey);

        if (!cachedValue) {
            const audio: AudioModel = await this.audioRepository
                .findOne(params.filter)
                .select(params.select || {})
                .lean();

            await this.cacheService.set(cacheKey, audio);

            return audio;
        }

        return cachedValue;
    }

    async getAudiosList(params: GetAudiosListParams = {}): Promise<AudioModel[]> {
        const cachedValue = await this.cacheService.get<AudioModel[]>(AUDIOS_LIST_CACHE_KEY);

        if (!cachedValue) {
            const audiosList: AudioModel[] = await this.audioRepository
                .find(params.filter || {})
                .limit(params.limit || 0)
                .select(params.select || {})
                .lean();

            await this.cacheService.set(AUDIOS_LIST_CACHE_KEY, audiosList);

            return audiosList;
        }

        return cachedValue;
    }

    async updateCaches() {
        if (!this.isUpdatingCaches) {
            const start = Date.now();

            this.logger.debug('Updating caches');
            this.isUpdatingCaches = true;

            this.cacheService
                .deleteAll()
                .then(() => this.getAudiosList())
                .finally(() => {
                    this.isUpdatingCaches = false;
                    this.logger.debug(`Caches updated: ${Date.now() - start}ms`);
                });
        } else {
            this.logger.debug('Caches already updating. Skipping');
        }
    }

    async cleanUpAudios() {
        const filter = { deletedAt: { $lte: getSubtractedDate(1, 'day') } };

        return this.audioRepository.deleteMany(filter, { lean: true });
    }
}
