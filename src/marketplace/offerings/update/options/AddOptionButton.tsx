import { FunctionComponent } from 'react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import { OPTION_FORM_ID } from './constants';

const AddOptionDialog = lazyComponent(() =>
  import('./AddOptionDialog').then((module) => ({
    default: module.AddOptionDialog,
  })),
);

export const AddOptionButton: FunctionComponent<{
  offering;
  refetch;
  type;
}> = ({ offering, refetch, type }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(AddOptionDialog, {
      resolve: { offering, refetch, type },
      formId: OPTION_FORM_ID,
      size: 'lg',
    });
  };
  return <AddButton action={callback} />;
};
