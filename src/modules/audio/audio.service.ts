import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { AudioEntity } from './entities';
import { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { getSubtractedDate } from '@utils';
import { AudioModel } from '@/modules/audio/audio.model';
import { DeleteAudioFilter, GetAudiosListParams, UpdateAudioParams } from '@/modules/audio/audio.interfaces';
import { CreateAudioDto } from '@/modules/audio/dto';
import { AUDIOS_LIST_CACHE_KEY } from '@/modules/audio/audio.constants';
import { CacheService } from '@/modules/cache/cache.service';

@Injectable()
export class AudioService {
    private readonly logger = new Logger(AudioService.name);

    constructor(
        @InjectModel(AudioEntity) private readonly audioRepository: ReturnModelType<typeof AudioEntity>,
        private cacheService: CacheService,
    ) {}

    async createAudio(audio: CreateAudioDto): Promise<AudioModel> {
        const newAudio = await this.audioRepository.create(audio);

        await this.cacheService.deleteAll();

        return newAudio.toObject();
    }

    async updateAudio(params: UpdateAudioParams): Promise<AudioModel> {
        await this.cacheService.deleteAll();

        return this.audioRepository.findOneAndUpdate(params.filter, params.update, { new: true }).lean();
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

    async deleteAudio(filter: DeleteAudioFilter = {}): Promise<AudioModel> {
        await this.cacheService.deleteAll();

        return this.audioRepository.findOneAndUpdate(filter, { deletedAt: Date.now() }, { new: true }).lean();
    }

    async updateCaches() {
        await this.cacheService.deleteAll();
        await this.getAudiosList();
    }

    async cleanUpAudios() {
        const filter = { deletedAt: { $lte: getSubtractedDate(1, 'day') } };

        return this.audioRepository.deleteMany(filter, { lean: true });
    }
}
