import { TelegramAudioEntity } from '@/modules/audio/entities';
import { UserEntity } from '@/modules/user/entities';

export class CreateAudioDto {
    name: string;
    content: Buffer;
    telegramMetadata: TelegramAudioEntity;
    authoredBy: UserEntity;
    createdBy: UserEntity;
}
