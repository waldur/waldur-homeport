import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const UpdateFloatingIpsDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UpdateFloatingIpsDialog" */ './UpdateFloatingIpsDialog'
    ),
  'UpdateFloatingIpsDialog',
);

const validators = [validateState('OK')];

export const UpdateFloatingIpsAction = ({ resource }) => (
  <DialogActionItem
    resource={resource}
    title={translate('Update floating IPs')}
    validators={validators}
    modalComponent={UpdateFloatingIpsDialog}
  />
);
