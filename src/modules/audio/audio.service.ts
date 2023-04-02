import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { AudioEntity } from './entities';
import { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { getSubtractedDate } from '@utils';
import { AudioModel } from '@/modules/audio/audio.model';
import { DeleteAudioFilter, GetAudiosListParams, UpdateAudioParams, UserRef } from '@/modules/audio/audio.interfaces';
import { CreateAudioDto } from '@/modules/audio/dto';
import { CACHE_PREFIX, POPULATE_USER_SELECT_FIELDS } from '@/modules/audio/audio.constants';
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

        return newAudio.toObject({ getters: true });
    }

    async updateAudio(params: UpdateAudioParams): Promise<AudioModel> {
        await this.cacheService.deleteAll();

        return this.audioRepository
            .findOneAndUpdate(params.filter, params.update, { new: true })
            .populate({ path: 'authoredBy', select: POPULATE_USER_SELECT_FIELDS })
            .populate({ path: 'createdBy', select: POPULATE_USER_SELECT_FIELDS })
            .populate({ path: 'deletedBy', select: POPULATE_USER_SELECT_FIELDS })
            .lean({ virtuals: true });
    }

    async getAudiosList(params: GetAudiosListParams = {}): Promise<AudioModel[]> {
        const cacheKey = [CACHE_PREFIX, 'audiosList', JSON.stringify(params)].join('');
        const cachedValue = await this.cacheService.get<AudioModel[]>(cacheKey);

        if (!cachedValue) {
            const { filter, options } = params;

            const audiosList: AudioModel[] = await this.audioRepository
                .find(filter || {})
                .limit(params.options?.limit || 0)
                .sort(options?.sort)
                .select(options?.select || {})
                .populate({ path: 'authoredBy', select: POPULATE_USER_SELECT_FIELDS })
                .populate({ path: 'createdBy', select: POPULATE_USER_SELECT_FIELDS })
                .populate({ path: 'deletedBy', select: POPULATE_USER_SELECT_FIELDS })
                .lean({ virtuals: true });

            await this.cacheService.set(cacheKey, audiosList);

            return audiosList;
        }

        return cachedValue;
    }

    async deleteAudio(filter: DeleteAudioFilter = {}, deletedBy: UserRef): Promise<AudioModel> {
        const updateValue = { deletedAt: Date.now(), deletedBy };

        await this.cacheService.deleteAll();

        return this.audioRepository
            .findOneAndUpdate(filter, updateValue, { new: true })
            .populate({ path: 'createdBy', select: POPULATE_USER_SELECT_FIELDS })
            .populate({ path: 'deletedBy', select: POPULATE_USER_SELECT_FIELDS })
            .lean({ virtuals: true });
    }

    async cleanUpAudios() {
        const filter = { deletedAt: { $lte: getSubtractedDate(1, 'day') } };

        return this.audioRepository.deleteMany(filter, { lean: { virtuals: true } });
    }
}
