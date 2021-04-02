import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateStaffAction } from '@waldur/marketplace/resources/actions/utils';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const SetBackendIdDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "SetBackendIdDialog" */ './SetBackendIdDialog'),
  'SetBackendIdDialog',
);

const validators = [validateStaffAction];

export const SetBackendIdAction: FC<any> = ({ resource, reInitResource }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Set backend ID')}
    modalComponent={SetBackendIdDialog}
    extraResolve={{ reInitResource }}
    resource={resource}
  />
);
