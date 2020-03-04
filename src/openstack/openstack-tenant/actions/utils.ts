import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { ActionContext } from '@waldur/resource/actions/types';

export function userCanModifyTenant(ctx: ActionContext): string {
  if (
    ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES &&
    !ctx.user.is_staff
  ) {
    return translate('Only staff can manage OpenStack tenant.');
  }
}
