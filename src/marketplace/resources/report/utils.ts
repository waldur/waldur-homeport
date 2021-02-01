import { translate } from '@waldur/i18n/translate';
import { ActionContext } from '@waldur/resource/actions/types';

export const validatePermissions = (ctx: ActionContext) => {
  if (ctx.user.is_staff) {
    return;
  }
  return translate(`Only staff users are allowed to perform this action.`);
};
