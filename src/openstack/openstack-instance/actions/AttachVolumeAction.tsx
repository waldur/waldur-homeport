import { PlusCircle } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { OpenStackInstance } from '../types';

const AttachVolumeDialog = lazyComponent(
  () => import('./AttachVolumeDialog'),
  'AttachVolumeDialog',
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
    iconNode={<PlusCircle />}
    modalComponent={AttachVolumeDialog}
    resource={resource}
    validators={validators}
    extraResolve={{ refetch }}
  />
);
