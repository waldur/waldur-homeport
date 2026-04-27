import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionButton } from '@/resource/actions/DialogActionButton';

import { VolumeActionProps } from './VolumeActionProps';

const CreateSnapshotDialog = lazyComponent(() =>
  import('./CreateSnapshotDialog').then((module) => ({
    default: module.CreateSnapshotDialog,
  })),
);

const validators = [validateState('OK')];

export const CreateSnapshotAction: FC<VolumeActionProps> = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    title={translate('Create')}
    iconNode={<PlusCircleIcon weight="bold" />}
    modalComponent={CreateSnapshotDialog}
    resource={resource}
    validators={validators}
    extraResolve={{ refetch }}
  />
);
