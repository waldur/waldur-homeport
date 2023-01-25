import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const RetypeDialog = lazyComponent(
  () => import('./RetypeDialog'),
  'RetypeDialog',
);

const validators = [validateRuntimeState('available'), validateState('OK')];

export const RetypeAction: ActionItemType = ({ resource, refetch }) =>
  isFeatureVisible('openstack.volume_types') ? (
    <DialogActionItem
      title={translate('Retype')}
      validators={validators}
      modalComponent={RetypeDialog}
      resource={resource}
      extraResolve={{ refetch }}
    />
  ) : null;
