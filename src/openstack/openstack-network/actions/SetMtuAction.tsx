import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const SetMtuDialog = lazyComponent(
  () => import('./SetMtuDialog'),
  'SetMtuDialog',
);

const validators = [validateState('OK')];

export const SetMtuAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Set MTU')}
    modalComponent={SetMtuDialog}
    resource={resource}
    extraResolve={{ refetch }}
  />
);
