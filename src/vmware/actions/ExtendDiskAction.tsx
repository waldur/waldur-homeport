import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const ExtendDiskDialog = lazyComponent(
  () => import(/* webpackChunkName: "ExtendDiskDialog" */ './ExtendDiskDialog'),
  'ExtendDiskDialog',
);

const validators = [validateState('OK')];

export const ExtendDiskAction = ({ resource }) => (
  <DialogActionItem
    modalComponent={ExtendDiskDialog}
    title={translate('Extend')}
    validators={validators}
    resource={resource}
  />
);
