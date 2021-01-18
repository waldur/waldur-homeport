import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { VolumeActionProps } from './VolumeActionProps';

const CreateSnapshotDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CreateSnapshotDialog" */ './CreateSnapshotDialog'
    ),
  'CreateSnapshotDialog',
);

const validators = [validateState('OK')];

export const CreateSnapshotAction: FC<VolumeActionProps> = ({ resource }) => (
  <DialogActionButton
    title={translate('Create')}
    icon="fa fa-plus"
    modalComponent={CreateSnapshotDialog}
    resource={resource}
    validators={validators}
  />
);
