import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validatePermissions } from '@waldur/marketplace/resources/report/utils';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

const SetBackendIdDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "SetBackendIdDialog" */ './SetBackendIdDialog'),
  'SetBackendIdDialog',
);

const validators = [validatePermissions];

export const SetBackendIdButton: FC<any> = ({ resource, reInitResource }) => (
  <DialogActionButton
    validators={validators}
    title={translate('Set backend ID')}
    modalComponent={SetBackendIdDialog}
    extraResolve={{ reInitResource }}
    resource={resource}
  />
);
