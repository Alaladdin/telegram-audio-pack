import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TelegrafExecutionContext, TelegrafException } from 'nestjs-telegraf';
import { Context } from '../interfaces';

@Injectable()
export class PrivateChatGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const telegrafExecutionContext = TelegrafExecutionContext.create(context);
        const { chat, $t } = telegrafExecutionContext.getContext<Context>();

        if (chat && chat.type !== 'private') {
            throw new TelegrafException($t('errors.command_for_private_chat_only'));
        }

        return true;
    }
}
