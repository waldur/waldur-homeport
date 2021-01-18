import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { TenantActionProps } from './types';

const CreateSecurityGroupDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CreateSecurityGroupDialog" */ './CreateSecurityGroupDialog'
    ),
  'CreateSecurityGroupDialog',
);

const validators = [validateState('OK')];

export const CreateSecurityGroupAction: FC<TenantActionProps> = ({
  resource,
}) => (
  <DialogActionButton
    title={translate('Create')}
    icon="fa fa-plus"
    modalComponent={CreateSecurityGroupDialog}
    resource={resource}
    dialogSize="xl"
    validators={validators}
  />
);
