import { translate } from '@waldur/i18n';
import { marketplaceIsVisible } from '@waldur/marketplace/utils';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

import { TerminateDialog } from './TerminateContainer';

export default function createAction(ctx): ResourceAction {
  return {
    name: 'terminate_resource',
    type: 'form',
    method: 'POST',
    component: TerminateDialog,
    title: translate('Terminate'),
    useResolve: true,
    isVisible:
      marketplaceIsVisible() && ctx.resource.marketplace_resource_uuid !== null,
    validators: [validateState('OK', 'Erred')],
  };
}
