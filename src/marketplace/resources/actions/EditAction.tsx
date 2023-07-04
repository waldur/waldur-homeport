import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const EditDialog = lazyComponent(() => import('./EditDialog'), 'EditDialog');

const validators = [validateState('OK')];

const CUSTOM_EDIT_ACTION_RESOURCE_TYPES = [
  'OpenStackTenant.Instance',
  'OpenStack.Tenant',
  'OpenStackTenant.Volume',
  'SLURM.Allocation',
  'VMware.VirtualMachine',
];

export const EditAction: ActionItemType = ({ resource, refetch }) =>
  CUSTOM_EDIT_ACTION_RESOURCE_TYPES.includes(resource.resource_type) ? null : (
    <DialogActionItem
      validators={validators}
      title={translate('Edit')}
      modalComponent={EditDialog}
      resource={resource}
      extraResolve={{ refetch }}
    />
  );
