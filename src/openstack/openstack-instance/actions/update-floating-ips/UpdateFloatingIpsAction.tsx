import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const UpdateFloatingIpsDialog = lazyComponent(
  () => import('./UpdateFloatingIpsDialog'),
  'UpdateFloatingIpsDialog',
);

const validators = [validateState('OK')];

export const UpdateFloatingIpsAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionItem
    resource={resource}
    title={translate('Update floating IPs')}
    validators={validators}
    modalComponent={UpdateFloatingIpsDialog}
    extraResolve={{ refetch }}
  />
);
