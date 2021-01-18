import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const ChangeLimitsDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "ChangeLimitsDialog" */ './ChangeLimitsDialog'),
  'ChangeLimitsDialog',
);

const validators = [validateState('OK')];

export const ChangeLimitsAction = ({ resource }) =>
  resource.marketplace_resource_uuid !== null ? (
    <DialogActionItem
      validators={validators}
      title={translate('Change limits')}
      dialogSize="lg"
      modalComponent={ChangeLimitsDialog}
      resource={resource}
    />
  ) : null;
