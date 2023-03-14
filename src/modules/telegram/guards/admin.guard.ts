import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TelegrafExecutionContext, TelegrafException } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';
import { ADMINS_IDS } from '../telegram.constants';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = TelegrafExecutionContext.create(context);
    const { from } = ctx.getContext<Context>();
    const isAdmin = !!from && ADMINS_IDS.includes(from.id);

    if (!isAdmin) {
      throw new TelegrafException('You are not admin 😡'); // todo review this
    }

    return true;
  }
}
