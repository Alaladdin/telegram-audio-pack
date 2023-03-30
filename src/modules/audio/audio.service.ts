import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { AudioEntity } from './entities';
import { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { getSubtractedDate } from '@utils';
import { AudioModel } from '@/modules/audio/audio.model';
import { DeleteAudioFilter, GetAudiosListParams, UpdateAudioParams, UserRef } from '@/modules/audio/audio.interfaces';
import { CreateAudioDto } from '@/modules/audio/dto';
import { POPULATE_USER_SELECT_FIELDS } from '@/modules/audio/audio.constants';

@Injectable()
export class AudioService {
    private readonly logger = new Logger(AudioService.name);

    constructor(@InjectModel(AudioEntity) private readonly audioRepository: ReturnModelType<typeof AudioEntity>) {}

    async createAudio(audio: CreateAudioDto): Promise<AudioModel> {
        const newAudio = await this.audioRepository.create(audio);

        return newAudio.toObject({ virtuals: true });
    }

    async updateAudio(params: UpdateAudioParams): Promise<AudioModel> {
        return this.audioRepository
            .findOneAndUpdate(params.filter, params.update, { new: true })
            .populate({ path: 'authoredBy', select: POPULATE_USER_SELECT_FIELDS })
            .populate({ path: 'createdBy', select: POPULATE_USER_SELECT_FIELDS })
            .populate({ path: 'deletedBy', select: POPULATE_USER_SELECT_FIELDS })
            .lean({ virtuals: true });
    }

    async getAudiosList(params: GetAudiosListParams = {}): Promise<AudioModel[]> {
        return this.audioRepository
            .find(params.filter || {})
            .limit(params.options?.limit || 0)
            .sort(params.options?.sort)
            .populate({ path: 'authoredBy', select: POPULATE_USER_SELECT_FIELDS })
            .populate({ path: 'createdBy', select: POPULATE_USER_SELECT_FIELDS })
            .populate({ path: 'deletedBy', select: POPULATE_USER_SELECT_FIELDS })
            .lean({ virtuals: true });
    }

    async deleteAudio(filter: DeleteAudioFilter = {}, deletedBy: UserRef): Promise<AudioModel> {
        const updateValue = { deletedAt: Date.now(), deletedBy };

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
