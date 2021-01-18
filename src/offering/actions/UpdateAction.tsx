import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

import { OfferingActionProps } from './types';
import { validatePermissions, validateOfferingState } from './utils';

const UpdateDialog = lazyComponent(
  () => import(/* webpackChunkName: "UpdateDialog" */ './UpdateDialog'),
  'UpdateDialog',
);

const validators = [validateOfferingState('OK', 'Erred'), validatePermissions];

export const UpdateAction: FC<OfferingActionProps> = ({ resource }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Edit')}
    modalComponent={UpdateDialog}
    resource={resource}
  />
);
