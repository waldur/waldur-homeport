import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const EditNetworkDialog = lazyComponent(
  () => import('./EditNetworkDialog'),
  'EditNetworkDialog',
);

const validators = [validateState('OK')];

export const EditNetworkAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Edit')}
    modalComponent={EditNetworkDialog}
    resource={resource}
    extraResolve={{ refetch }}
  />
);
