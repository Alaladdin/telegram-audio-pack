import { TelegramAudio, TelegramUser } from '@/modules/telegram/interfaces';
import { CHARS_TO_MD_ESCAPE, UNKNOWN_USER_NAME } from '@/modules/telegram/telegram.constants';
import { CreateAudioDto } from '@/modules/audio/dto';
import { map } from '@utils';

export const getMappedAudio = (audio: TelegramAudio): CreateAudioDto['voice'] => ({
    fileId: audio.file_id,
    fileUniqueId: audio.file_unique_id,
    size: audio.file_size,
    mimeType: audio.mime_type,
    duration: audio.duration,
});

export const getDisplayName = (user?: TelegramUser) => {
    if (!user) return UNKNOWN_USER_NAME;

    const firstName = user.first_name;
    const lastName = user.last_name;

    return lastName ? `${firstName} ${lastName}` : firstName;
};

export const getEscapedMessage = (message: string) => {
    const replacer = (char: string) => (CHARS_TO_MD_ESCAPE.includes(char) ? `\\${char}` : char);

    return map(message.split(''), replacer).join('');
};
