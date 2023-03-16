import { Context } from '@/modules/telegram/interfaces/context.interface';

export const baseMiddleware = (ctx: Context, next: () => Promise<void>) => {
    const { from } = ctx;
    const username = [];

    if (from?.first_name) {
        username.push(from.first_name);

        if (from?.last_name) {
            username.push(from.last_name);
        }
    } else if (from?.username) {
        username.push(from.username);
    } else {
        username.push('INCOGNITO');
    }

    ctx.username = username.join(' ');
    // ctx.$reply = ctx.replyWithMarkdownV2

    next();
};
