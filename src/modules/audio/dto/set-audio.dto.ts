import { TelegramAudioEntity } from '@/modules/audio/entities';
import { UserEntity } from '@/modules/user/entities';

export class SetAudioDto {
    name: string;
    content: Buffer;
    telegramMetadata: TelegramAudioEntity;
    authoredBy: UserEntity;
    createdBy: UserEntity;
    deletedBy?: UserEntity;
    deletedAt?: Date;
    usedTimes?: number;
}
