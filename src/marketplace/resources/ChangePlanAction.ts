import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

import { marketplaceIsVisible } from '../utils';

export default function createAction(ctx): ResourceAction {
  return {
    name: 'change_plan',
    type: 'form',
    method: 'POST',
    component: 'marketplaceResourcePlanChangeDialog',
    title: translate('Change plan'),
    useResolve: true,
    dialogSize: 'lg',
    isVisible: marketplaceIsVisible() && ctx.resource.marketplace_resource_uuid !== null,
    validators: [validateState('OK')],
  };
}
