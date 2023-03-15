import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TelegrafExecutionContext, TelegrafException } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';
import { ADMINS_IDS } from '../telegram.constants';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const telegrafExecutionContext = TelegrafExecutionContext.create(context);
    const { from, $t } = telegrafExecutionContext.getContext<Context>();
    const isAdmin = !!from && ADMINS_IDS.includes(from.id);

    if (!isAdmin) {
      throw new TelegrafException($t('errors.not_admin'));
    }

    return true;
  }
}
