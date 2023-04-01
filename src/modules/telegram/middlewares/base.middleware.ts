import { Context } from '@/modules/telegram/interfaces/context.interface';
import { ADMINS_IDS } from '@/modules/telegram/telegram.constants';
import { getEscapedMessage } from '@/modules/telegram/utils';

export const baseMiddleware = (ctx: Context, next: () => Promise<void>) => {
    const user = ctx.from;

    ctx.isAdmin = !!user && ADMINS_IDS.includes(user.id);

    ctx.$sendMessageWithMD = (message, extra) => {
        return ctx.sendMessage(`\`${message}\``, { ...extra, parse_mode: 'MarkdownV2' });
    };

    ctx.$replyWithMD = (message, extra) => {
        const escapedMessage = getEscapedMessage(message);

        return ctx.replyWithMarkdownV2(escapedMessage, extra);
    };

    ctx.$replyWithMDCode = (message, extra) => {
        const escapedMessage = getEscapedMessage(message);

        return ctx.replyWithMarkdownV2(`\`${escapedMessage}\``, extra);
    };

    next();
};
