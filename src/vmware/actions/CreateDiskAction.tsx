import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

const CreateDiskDialog = lazyComponent(() =>
  import('./CreateDiskDialog').then((module) => ({
    default: module.CreateDiskDialog,
  })),
);

const validators = [validateState('OK')];

export const CreateDiskAction: FC<{ resource }> = ({ resource }) => (
  <DialogActionButton
    title={translate('Create disk')}
    iconNode={<PlusCircleIcon weight="bold" />}
    modalComponent={CreateDiskDialog}
    resource={resource}
    validators={validators}
  />
);
