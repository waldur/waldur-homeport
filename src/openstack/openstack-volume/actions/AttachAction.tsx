import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateRuntimeState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const AttachDialog = lazyComponent(
  () => import(/* webpackChunkName: "AttachDialog" */ './AttachDialog'),
  'AttachDialog',
);

const validators = [validateRuntimeState('available')];

export const AttachAction = ({ resource }) => (
  <DialogActionItem
    title={translate('Attach')}
    validators={validators}
    modalComponent={AttachDialog}
    resource={resource}
  />
);
