import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DYNAMIC_STORAGE_MODE } from '@waldur/openstack/constants';
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

export const RetypeAction: ActionItemType = ({
  resource,
  marketplaceResource,
  refetch,
}) =>
  marketplaceResource?.offering_plugin_options?.storage_mode ===
  DYNAMIC_STORAGE_MODE ? (
    <DialogActionItem
      title={translate('Retype')}
      validators={validators}
      modalComponent={RetypeDialog}
      resource={resource}
      extraResolve={{ refetch }}
    />
  ) : null;
