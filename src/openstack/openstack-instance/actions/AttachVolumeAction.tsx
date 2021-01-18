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
  () =>
    import(/* webpackChunkName: "AttachVolumeDialog" */ './AttachVolumeDialog'),
  'AttachVolumeDialog',
);

interface AttachVolumeActionProps {
  resource: OpenStackInstance;
}

const validators = [
  validateState('OK'),
  validateRuntimeState('SHUTOFF', 'ACTIVE'),
];

export const AttachVolumeAction: FC<AttachVolumeActionProps> = ({
  resource,
}) => (
  <DialogActionButton
    title={translate('Attach volume')}
    icon="fa fa-plus"
    modalComponent={AttachVolumeDialog}
    resource={resource}
    validators={validators}
  />
);
