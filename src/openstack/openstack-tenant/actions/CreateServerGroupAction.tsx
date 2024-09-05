import { PlusCircle } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { TenantActionProps } from './types';

const CreateServerGroupDialog = lazyComponent(
  () => import('./CreateServerGroupDialog'),
  'CreateServerGroupDialog',
);

const validators = [validateState('OK')];

export const CreateServerGroupAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    title={translate('Create')}
    iconNode={<PlusCircle />}
    modalComponent={CreateServerGroupDialog}
    resource={resource}
    validators={validators}
    extraResolve={{ refetch }}
  />
);
