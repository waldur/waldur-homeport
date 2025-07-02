import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OpenStackInstance } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

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
