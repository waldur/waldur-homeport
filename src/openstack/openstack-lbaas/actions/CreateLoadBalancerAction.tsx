import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionButton } from '@/resource/actions/DialogActionButton';

import { TenantActionProps } from './types';

const CreateLoadBalancerDialog = lazyComponent(() =>
  import('./CreateLoadBalancerDialog').then((module) => ({
    default: module.CreateLoadBalancerDialog,
  })),
);

const validators = [validateState('OK')];

export const CreateLoadBalancerAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    title={translate('Create')}
    iconNode={<PlusCircleIcon weight="bold" />}
    modalComponent={CreateLoadBalancerDialog}
    resource={resource}
    validators={validators}
    extraResolve={{ refetch }}
  />
);
