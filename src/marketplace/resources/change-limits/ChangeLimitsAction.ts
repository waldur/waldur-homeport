import { translate } from '@waldur/i18n';
import { marketplaceIsVisible } from '@waldur/marketplace/utils';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(ctx): ResourceAction {
  return {
    name: 'update_limits',
    type: 'form',
    method: 'POST',
    component: 'marketplaceResourceChangeLimitsDialog',
    title: translate('Change limits'),
    useResolve: true,
    dialogSize: 'lg',
    isVisible:
      marketplaceIsVisible() && ctx.resource.marketplace_resource_uuid !== null,
    validators: [validateState('OK')],
  };
}
