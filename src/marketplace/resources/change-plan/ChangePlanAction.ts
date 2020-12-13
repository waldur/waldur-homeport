import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { marketplaceIsVisible } from '@waldur/marketplace/utils';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

const ChangePlanDialog = lazyComponent(
  () => import(/* webpackChunkName: "ChangePlanDialog" */ './ChangePlanDialog'),
  'ChangePlanDialog',
);

export default function createAction(ctx): ResourceAction {
  return {
    name: 'change_plan',
    type: 'form',
    method: 'POST',
    component: ChangePlanDialog,
    title: translate('Change plan'),
    useResolve: true,
    dialogSize: 'lg',
    isVisible:
      marketplaceIsVisible() && ctx.resource.marketplace_resource_uuid !== null,
    validators: [validateState('OK')],
  };
}
