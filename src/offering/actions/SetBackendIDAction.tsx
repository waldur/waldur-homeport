import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validatePermissions } from '@waldur/offering/actions/utils';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

import { OfferingActionProps } from './types';

const SetBackendIdDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "SetBackendIdDialog" */ './SetBackendIdDialog'),
  'SetBackendIdDialog',
);

const validators = [validatePermissions];

export const SetBackendIDAction: FC<OfferingActionProps> = ({ resource }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Set backend ID')}
    modalComponent={SetBackendIdDialog}
    resource={resource}
  />
);
