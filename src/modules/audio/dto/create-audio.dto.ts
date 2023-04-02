import { TelegramAudioEntity } from '@/modules/audio/entities';

export class CreateAudioDto {
    name: string;
    content: Buffer;
    voice: TelegramAudioEntity;
}
