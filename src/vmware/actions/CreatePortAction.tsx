import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionButton } from '@/resource/actions/DialogActionButton';

const CreatePortDialog = lazyComponent(() =>
  import('./CreatePortDialog').then((module) => ({
    default: module.CreatePortDialog,
  })),
);

const validators = [validateState('OK')];

export const CreatePortAction: FC<{ resource }> = ({ resource }) => (
  <DialogActionButton
    title={translate('Create Network adapter')}
    iconNode={<PlusCircleIcon weight="bold" />}
    modalComponent={CreatePortDialog}
    resource={resource}
    validators={validators}
  />
);
