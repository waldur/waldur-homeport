import { LifebuoyIcon } from '@phosphor-icons/react';
import { OpenStackInstance } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateOpenStackInstancePowerPermission } from '@/openstack/utils';
import { validateState, validateRuntimeState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const RescueDialog = lazyComponent(() =>
  import('./RescueDialog').then((module) => ({
    default: module.RescueDialog,
  })),
);

const validators = [
  validateState('OK'),
  validateRuntimeState('ACTIVE'),
  validateOpenStackInstancePowerPermission,
];

export const RescueAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    title={translate('Rescue')}
    modalComponent={RescueDialog}
    validators={validators}
    resource={resource as OpenStackInstance}
    extraResolve={{ refetch }}
    iconNode={<LifebuoyIcon weight="bold" />}
  />
);
