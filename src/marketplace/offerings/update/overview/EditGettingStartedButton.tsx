import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

import { GETTING_STARTED_FORM_ID } from './constants';

const EditGettingStartedDialog = lazyComponent(() =>
  import('./EditGettingStartedDialog').then((module) => ({
    default: module.EditGettingStartedDialog,
  })),
);

export const EditGettingStartedButton: FC<{ offering; refetch }> = (props) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditGettingStartedDialog, {
      resolve: props,
      formId: GETTING_STARTED_FORM_ID,
      size: 'lg',
    });
  };
  return <CompactEditButton onClick={callback} variant="secondary" />;
};
