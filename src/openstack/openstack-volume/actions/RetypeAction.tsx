import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const RetypeDialog = lazyComponent(
  () => import(/* webpackChunkName: "RetypeDialog" */ './RetypeDialog'),
  'RetypeDialog',
);

const validators = [validateRuntimeState('available'), validateState('OK')];

export const RetypeAction = ({ resource }) =>
  isFeatureVisible('openstack.volume-types') ? (
    <DialogActionItem
      title={translate('Retype')}
      validators={validators}
      modalComponent={RetypeDialog}
      resource={resource}
    />
  ) : null;
