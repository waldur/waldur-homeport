import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const SetMtuDialog = lazyComponent(
  () => import(/* webpackChunkName: "SetMtuDialog" */ './SetMtuDialog'),
  'SetMtuDialog',
);

const validators = [validateState('OK')];

export const SetMtuAction = ({ resource }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Set MTU')}
    modalComponent={SetMtuDialog}
    resource={resource}
  />
);
