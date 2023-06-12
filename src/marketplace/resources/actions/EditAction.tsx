import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const EditDialog = lazyComponent(() => import('./EditDialog'), 'EditDialog');

const validators = [validateState('OK')];

export const EditAction: ActionItemType = ({ resource, refetch }) =>
  resource.scope ? (
    <DialogActionItem
      validators={validators}
      title={translate('Edit')}
      modalComponent={EditDialog}
      resource={resource}
      extraResolve={{ refetch }}
    />
  ) : null;
