import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { Resource } from '@waldur/resource/types';

const ChangePlanDialog = lazyComponent(
  () => import(/* webpackChunkName: "ChangePlanDialog" */ './ChangePlanDialog'),
  'ChangePlanDialog',
);

const validators = [validateState('OK')];

export const ChangePlanAction: FC<{ resource: Resource }> = ({ resource }) =>
  resource.marketplace_resource_uuid !== null ? (
    <DialogActionItem
      validators={validators}
      title={translate('Change plan')}
      dialogSize="lg"
      modalComponent={ChangePlanDialog}
      resource={resource}
    />
  ) : null;
