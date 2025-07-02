import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { TenantActionProps } from './types';

const CreateNetworkDialog = lazyComponent(() =>
  import('./CreateNetworkDialog').then((module) => ({
    default: module.CreateNetworkDialog,
  })),
);

const validators = [validateState('OK')];

export const CreateNetworkAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    title={translate('Create')}
    iconNode={<PlusCircleIcon weight="bold" />}
    modalComponent={CreateNetworkDialog}
    resource={resource}
    validators={validators}
    extraResolve={{ refetch }}
  />
);
