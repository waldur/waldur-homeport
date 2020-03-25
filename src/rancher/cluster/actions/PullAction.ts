import { ENV } from '@waldur/core/services';
import { createPullAction } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export function pullAction(ctx): ResourceAction {
  const action = createPullAction(ctx);
  return {
    ...action,
    isVisible:
      action.isVisible &&
      (ctx.user.is_staff || !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE),
  };
}
