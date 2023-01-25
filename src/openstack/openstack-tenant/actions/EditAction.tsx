import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

import { userCanModifyTenant } from './utils';

const EditDialog = lazyComponent(() => import('./EditDialog'), 'EditDialog');

const validators = [userCanModifyTenant];

export const EditAction = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Edit')}
    modalComponent={EditDialog}
    resource={resource}
    extraResolve={{ refetch }}
  />
);
