import { translate } from '@waldur/i18n';
import { ResourceAction } from '@waldur/resource/actions/types';

import { marketplaceIsVisible } from '../utils';

export default function createAction(): ResourceAction {
  return {
    name: 'change_plan',
    type: 'form',
    method: 'POST',
    component: 'marketplaceResourcePlanChangeDialog',
    title: translate('Change plan'),
    useResolve: true,
    dialogSize: 'lg',
    isVisible: marketplaceIsVisible(),
  };
}
