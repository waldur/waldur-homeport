import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { userCanModifyTenant } from '@waldur/marketplace/resources/utils';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const EditDialog = lazyComponent(
  () => import(/* webpackChunkName: "EditDialog" */ './EditDialog'),
  'EditDialog',
);

const validators = [userCanModifyTenant];

export const EditAction = ({ resource }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Edit')}
    modalComponent={EditDialog}
    resource={resource}
  />
);
