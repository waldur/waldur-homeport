import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionButton } from '@/resource/actions/DialogActionButton';
import { ActionItemType } from '@/resource/actions/types';

const UpdateFloatingIpsDialog = lazyComponent(() =>
  import('./UpdateFloatingIpsDialog').then((module) => ({
    default: module.UpdateFloatingIpsDialog,
  })),
);

const validators = [validateState('OK')];

export const UpdateFloatingIpsActionButton: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    resource={resource}
    title={translate('Update floating IPs')}
    validators={validators}
    modalComponent={UpdateFloatingIpsDialog}
    extraResolve={{ refetch }}
    dialogSize="lg"
  />
);
