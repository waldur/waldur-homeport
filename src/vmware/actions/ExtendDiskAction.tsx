import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const ExtendDiskDialog = lazyComponent(
  () => import('./ExtendDiskDialog'),
  'ExtendDiskDialog',
);

const validators = [validateState('OK')];

export const ExtendDiskAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    modalComponent={ExtendDiskDialog}
    title={translate('Extend')}
    validators={validators}
    resource={resource}
    extraResolve={{ refetch }}
  />
);
