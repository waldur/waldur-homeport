import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const VolumeExtendDialog = lazyComponent(
  () => import('./ExtendDialog'),
  'VolumeExtendDialog',
);

import { isBootable } from './utils';

const validators = [isBootable, validateState('OK')];

export const ExtendAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    modalComponent={VolumeExtendDialog}
    title={translate('Extend')}
    validators={validators}
    resource={resource}
    extraResolve={{ refetch }}
  />
);
