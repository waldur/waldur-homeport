import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OpenStackInstance } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateOpenStackInstanceManagePermission } from '@/openstack/utils';
import { validateRuntimeState, validateState } from '@/resource/actions/base';
import { DialogActionButton } from '@/resource/actions/DialogActionButton';

const AttachVolumeDialog = lazyComponent(() =>
  import('./AttachVolumeDialog').then((module) => ({
    default: module.AttachVolumeDialog,
  })),
);

interface AttachVolumeActionProps {
  resource: OpenStackInstance;
  refetch;
}

const validators = [
  validateState('OK'),
  validateRuntimeState('SHUTOFF', 'ACTIVE'),
  validateOpenStackInstanceManagePermission,
];

export const AttachVolumeAction: FC<AttachVolumeActionProps> = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    title={translate('Attach volume')}
    iconNode={<PlusCircleIcon weight="bold" />}
    modalComponent={AttachVolumeDialog}
    resource={resource}
    validators={validators}
    extraResolve={{ refetch }}
  />
);
