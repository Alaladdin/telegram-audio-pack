import { TelegramAudio, TelegramUser } from '@/modules/telegram/interfaces';
import { SetUserDto } from '@/modules/user/dto';
import { CHARS_TO_MD_ESCAPE, UNKNOWN_USER_NAME } from '@/modules/telegram/telegram.constants';
import { CreateAudioDto } from '@/modules/audio/dto';
import { map } from '@utils';

export const getMappedTelegramAudio = (audio: TelegramAudio): CreateAudioDto['telegramMetadata'] => ({
    fileId: audio.file_id,
    fileUniqueId: audio.file_unique_id,
    size: audio.file_size,
    mimeType: audio.mime_type,
    duration: audio.duration,
});

export const getMappedUser = (user: TelegramUser): SetUserDto => ({
    userId: user.id,
    username: user.username || null,
    displayName: getDisplayName(user),
    firstName: user.first_name,
    lastName: user.last_name || null,
    lang: user.language_code,
    isBot: user.is_bot,
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
