import { Scenes } from 'telegraf';
import { I18nTranslations } from '@/generated/localization.generated';
import { PathImpl2 } from '@nestjs/config';
import { TranslateOptions } from 'nestjs-i18n/dist/services/i18n.service';

export interface Context extends Scenes.SceneContext {
  $t: (key: PathImpl2<I18nTranslations>, options?: TranslateOptions) => string;
}
