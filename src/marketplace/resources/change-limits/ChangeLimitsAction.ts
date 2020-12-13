import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { marketplaceIsVisible } from '@waldur/marketplace/utils';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

const ChangeLimitsDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "ChangeLimitsDialog" */ './ChangeLimitsDialog'),
  'ChangeLimitsDialog',
);

export default function createAction(ctx): ResourceAction {
  return {
    name: 'update_limits',
    type: 'form',
    method: 'POST',
    component: ChangeLimitsDialog,
    title: translate('Change limits'),
    useResolve: true,
    dialogSize: 'lg',
    isVisible:
      marketplaceIsVisible() && ctx.resource.marketplace_resource_uuid !== null,
    validators: [validateState('OK')],
  };
}
