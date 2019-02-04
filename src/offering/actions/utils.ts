import { translate } from '@waldur/i18n/translate';
import { ActionContext } from '@waldur/resource/actions/types';

import { OfferingState, Offering } from '../types';

export const validatePermissions = (ctx: ActionContext<Offering>) => {
  if (ctx.user.is_staff) {
    return;
  }
  return translate(`Only staff users are allowed to perform this action.`);
};

export function validateOfferingState(...validStates: OfferingState[]): (ctx: ActionContext<Offering>) => string {
  return ctx => {
    if (!validStates.includes(ctx.resource.state)) {
      return translate('Valid states for operation: {validStates}.', {validStates: validStates.join(', ')});
    }
  };
}
