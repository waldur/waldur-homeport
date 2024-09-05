import { PlusCircle } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { VolumeActionProps } from './VolumeActionProps';

const CreateSnapshotDialog = lazyComponent(
  () => import('./CreateSnapshotDialog'),
  'CreateSnapshotDialog',
);

const validators = [validateState('OK')];

export const CreateSnapshotAction: FC<VolumeActionProps> = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    title={translate('Create')}
    iconNode={<PlusCircle />}
    modalComponent={CreateSnapshotDialog}
    resource={resource}
    validators={validators}
    extraResolve={{ refetch }}
  />
);
