import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const EditLoadBalancerDialog = lazyComponent(() =>
  import('./EditLoadBalancerDialog').then((module) => ({
    default: module.EditLoadBalancerDialog,
  })),
);

const validators = [validateState('OK')];

export const EditLoadBalancerAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionItem
    validators={validators}
    title={translate('Edit')}
    modalComponent={EditLoadBalancerDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<PencilSimpleIcon weight="bold" />}
  />
);
