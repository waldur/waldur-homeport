import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionButton } from '@/resource/actions/DialogActionButton';

const SubmitJobDialog = lazyComponent(() =>
  import('./SubmitJobDialog').then((module) => ({
    default: module.SubmitJobDialog,
  })),
);

interface SubmitJobActionProps {
  resource;
}

export const SubmitJobAction: FC<SubmitJobActionProps> = ({ resource }) => (
  <DialogActionButton
    title={translate('Submit job')}
    iconNode={<PlusCircleIcon weight="bold" />}
    modalComponent={SubmitJobDialog}
    resource={resource}
  />
);
