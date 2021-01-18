import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const VolumeExtendDialog = lazyComponent(
  () => import(/* webpackChunkName: "VolumeExtendDialog" */ './ExtendDialog'),
  'VolumeExtendDialog',
);

import { isBootable } from './utils';

const validators = [isBootable, validateState('OK')];

export const ExtendAction = ({ resource }) => (
  <DialogActionItem
    modalComponent={VolumeExtendDialog}
    title={translate('Extend')}
    validators={validators}
    resource={resource}
  />
);
