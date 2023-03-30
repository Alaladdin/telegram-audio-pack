import { TelegramAudioEntity } from '@/modules/audio/entities';
import { SetUserDto } from '@/modules/user/dto';

export class CreateAudioDto {
    name: string;
    content: Buffer;
    telegramMetadata: TelegramAudioEntity;
    authoredBy: SetUserDto;
    createdBy: SetUserDto;
}
