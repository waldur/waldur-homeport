import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { TenantActionProps } from './types';

const CreateServerGroupDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CreateServerGroupDialog" */ './CreateServerGroupDialog'
    ),
  'CreateServerGroupDialog',
);

const validators = [validateState('OK')];

export const CreateServerGroupAction: FC<TenantActionProps> = ({
  resource,
}) => (
  <DialogActionButton
    title={translate('Create')}
    icon="fa fa-plus"
    modalComponent={CreateServerGroupDialog}
    resource={resource}
    validators={validators}
  />
);
