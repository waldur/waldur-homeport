import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { TenantActionProps } from './types';

const CreateRouterDialog = lazyComponent(() =>
  import('./CreateRouterDialog').then((module) => ({
    default: module.CreateRouterDialog,
  })),
);

const validators = [validateState('OK')];

export const CreateRouterAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    title={translate('Create')}
    iconNode={<PlusCircleIcon weight="bold" />}
    modalComponent={CreateRouterDialog}
    resource={resource}
    validators={validators}
    extraResolve={{ refetch }}
  />
);
