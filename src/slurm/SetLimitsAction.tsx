import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateStaffAction } from '@waldur/marketplace/resources/actions/utils';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const SetLimitsDialog = lazyComponent(
  () => import(/* webpackChunkName: "SetLimitsDialog" */ './SetLimitsDialog'),
  'SetLimitsDialog',
);

const validators = [validateState('OK'), validateStaffAction];

export const SetLimitsAction = ({ resource }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Set limits')}
    modalComponent={SetLimitsDialog}
    resource={resource}
  />
);
