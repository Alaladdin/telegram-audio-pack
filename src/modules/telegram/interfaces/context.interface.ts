import { Context as tgContext } from 'telegraf';
import { I18nTranslations } from '@/generated/localization.generated';
import { PathImpl2 } from '@nestjs/config';
import { TranslateOptions } from 'nestjs-i18n/dist/services/i18n.service';
import { CallbackQuery, Update } from 'typegram';

// extends Scenes.SceneContext<'callback_query'>
export interface Context extends tgContext {
    username: string;
    $t: (key: PathImpl2<I18nTranslations>, options?: TranslateOptions) => string;
    // $reply: typeof Scenes.SceneContext
}

interface CallbackQueryWithData extends CallbackQuery.DataQuery {
    data: 'SAVE_AUDIO' | 'DISCARD_AUDIO';
}

export interface CallbackQueryContext extends tgContext<Update.CallbackQueryUpdate<CallbackQueryWithData>> {}
