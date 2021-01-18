import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const EditSubnetDialog = lazyComponent(
  () => import(/* webpackChunkName: "EditSubnetDialog" */ './EditSubnetDialog'),
  'EditSubnetDialog',
);

const validators = [validateState('OK')];

export const EditSubnetAction = ({ resource }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Edit')}
    modalComponent={EditSubnetDialog}
    resource={resource}
  />
);
