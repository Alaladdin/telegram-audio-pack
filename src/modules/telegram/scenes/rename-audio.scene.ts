// @ts-nocheck

import { Scene, SceneEnter, SceneLeave, On } from 'nestjs-telegraf';
import { RENAME_AUDIO_SCENE_ID, RENAME_AUDIO_SCENE_LEAVE_CODE } from '../telegram.constants';
import { SceneContext } from '@/modules/telegram/interfaces';
import { AudioService } from '@/modules/audio/audio.service';
import { Markup } from 'telegraf';

@Scene(RENAME_AUDIO_SCENE_ID)
export class RenameAudioScene {
    constructor(private readonly audioService: AudioService) {}

    @SceneEnter()
    async onSceneEnter(ctx: SceneContext) {
        const state = ctx.scene.state;
        const audio = await this.audioService.getAudio({ filter: { _id: state.audioId } });

        if (audio) {
            const message = ctx.$t('actions.renaming_audio', { args: { name: audio.name } });
            const messagePlaceholder = ctx.$t('actions.rename_audio_placeholder', { args: { name: audio.name } });

            state.oldName = audio.name;

            await ctx.$replyWithMDCode(message, {
                reply_markup: {
                    input_field_placeholder: messagePlaceholder,
                    force_reply: true,
                    selective: true,
                    is_persistent: true,
                    resize_keyboard: true,
                    one_time_keyboard: true,
                    keyboard: [[Markup.button.text(RENAME_AUDIO_SCENE_LEAVE_CODE, false)]],
                },
            });
        } else {
            await ctx.$replyWithMDCode(ctx.$t('base.not_found'));
            await ctx.scene.leave();
        }
    }

    @On('text')
    async onText(ctx: SceneContext) {
        const state = ctx.scene.state;
        const audioName = ctx.message?.text;

        if (audioName !== RENAME_AUDIO_SCENE_LEAVE_CODE) {
            const newAudio = await this.audioService.updateAudio({
                filter: { _id: state.audioId },
                update: { name: audioName },
            });

            if (newAudio) {
                state.newName = audioName;
            } else {
                await ctx.$replyWithMDCode(ctx.$t('base.not_found'));
            }
        }

        await ctx.scene.leave();
    }

    @SceneLeave()
    async onSceneLeave(ctx: SceneContext) {
        const state = ctx.scene.state;
        const notRenamedMessage = ctx.$t('actions.discarded');
        const renamedMessage = ctx.$t('actions.renamed_audio', { args: state });

        await state.onLeave(ctx);
        await ctx.$replyWithMDCode(state.newName ? renamedMessage : notRenamedMessage, {
            reply_markup: { remove_keyboard: true },
        });
    }
}
