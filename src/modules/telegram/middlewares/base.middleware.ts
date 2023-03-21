import { Context } from '@/modules/telegram/interfaces/context.interface';
import { ADMINS_IDS, UNKNOWN_USER_NAME } from '@/modules/telegram/telegram.constants';
import { User } from 'typegram';
import { ExtraReplyMessage } from 'telegraf/src/telegram-types';

export const baseMiddleware = (ctx: Context, next: () => Promise<void>) => {
    const user = ctx.from;

    ctx.displayName = getDisplayName(user);
    ctx.isAdmin = !!user && ADMINS_IDS.includes(user.id);
    ctx.$replyWithMarkdown = (message: string, extra?: ExtraReplyMessage) => {
        return ctx.replyWithMarkdownV2(`\`${message}\``, extra);
    };

    next();
};

const getDisplayName = (user?: User) => {
    if (!user) return UNKNOWN_USER_NAME;

    const firstName = user.first_name;
    const lastName = user.last_name;

    return lastName ? `${firstName} ${lastName}` : firstName;
};
