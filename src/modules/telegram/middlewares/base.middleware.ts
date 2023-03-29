import { Context } from '@/modules/telegram/interfaces/context.interface';
import { ADMINS_IDS } from '@/modules/telegram/telegram.constants';

export const baseMiddleware = (ctx: Context, next: () => Promise<void>) => {
    const user = ctx.from;

    ctx.isAdmin = !!user && ADMINS_IDS.includes(user.id);

    ctx.$sendMessageWithMarkdown = (message, extra) => {
        return ctx.sendMessage(`\`${message}\``, { ...extra, parse_mode: 'MarkdownV2' });
    };

    ctx.$replyWithMarkdown = (message, extra) => {
        return ctx.replyWithMarkdownV2(`\`${message}\``, extra);
    };

    next();
};
