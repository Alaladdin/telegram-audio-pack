import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { AudioEntity } from './entities';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { getSubtractedDate } from '@utils';
import { AudioModel } from '@/modules/audio/audio.model';
import { DeleteAudioFilter, GetAudiosListFilter, UpdateAudioFilter, UserRef } from '@/modules/audio/audio.interfaces';
import { SetAudioDto } from '@/modules/audio/dto';
@Injectable()
export class AudioService {
    private readonly logger = new Logger(AudioService.name);

    constructor(@InjectModel(AudioEntity) private readonly audioRepository: ModelType<AudioEntity>) {}

    async createAudio(audio: SetAudioDto): Promise<AudioModel> {
        const newAudio = await this.audioRepository.create(audio);

        return newAudio.toObject();
    }

    async updateAudio(audio: UpdateAudioFilter): Promise<AudioModel> {
        return this.audioRepository.findByIdAndUpdate(audio._id, audio).lean();
    }

    async getAudiosList(filter: GetAudiosListFilter = {}): Promise<AudioModel[]> {
        const populateSelect = { _id: 0, userId: 1, displayName: 1, username: 1 };

        return this.audioRepository
            .find(filter)
            .populate({ path: 'authoredBy', select: populateSelect })
            .populate({ path: 'createdBy', select: populateSelect })
            .populate({ path: 'deletedBy', select: populateSelect })
            .lean();
    }

    async deleteAudio(filter: DeleteAudioFilter = {}, deletedBy: UserRef): Promise<boolean> {
        const updateValue = { deletedAt: Date.now(), deletedBy };

        return this.audioRepository
            .findOneAndUpdate(filter, updateValue)
            .lean()
            .then(() => true)
            .catch((e) => {
                this.logger.error(e);

                throw e;
            });
    }

    async cleanUpAudios() {
        const filter = { deletedAt: { $lte: getSubtractedDate(1, 'day') } };

        return this.audioRepository.deleteMany(filter, { lean: true });
    }
}
