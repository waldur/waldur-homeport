import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const EditNetworkDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "EditNetworkDialog" */ './EditNetworkDialog'),
  'EditNetworkDialog',
);

const validators = [validateState('OK')];

export const EditNetworkAction = ({ resource }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Edit')}
    modalComponent={EditNetworkDialog}
    resource={resource}
  />
);
