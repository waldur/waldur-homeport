import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const CreateSubnetDialog = lazyComponent(
  () => import('./CreateSubnetDialog'),
  'CreateSubnetDialog',
);

const validators = [validateState('OK')];

export const CreateSubnetAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Create subnet')}
    modalComponent={CreateSubnetDialog}
    resource={resource}
    extraResolve={{ refetch }}
  />
);
