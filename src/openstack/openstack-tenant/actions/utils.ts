import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { type ActionContext } from '@/resource/actions/types';

export function userCanModifyTenant(ctx: ActionContext): string {
  if (
    ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES &&
    !ctx.user?.is_staff
  ) {
    return translate('Only staff can manage OpenStack tenant.');
  }
}

export const tenantQuotasStateValidator = validateState('OK');
