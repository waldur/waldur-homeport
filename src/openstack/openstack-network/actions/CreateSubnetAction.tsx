import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const CreateSubnetDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "CreateSubnetDialog" */ './CreateSubnetDialog'),
  'CreateSubnetDialog',
);

const validators = [validateState('OK')];

export const CreateSubnetAction = ({ resource }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Create subnet')}
    modalComponent={CreateSubnetDialog}
    resource={resource}
  />
);
