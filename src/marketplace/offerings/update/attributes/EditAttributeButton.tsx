import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

import { ATTRIBUTE_FORM_ID } from './constants';
import { EditAttributeDialogProps } from './types';

const EditAttributeDialog = lazyComponent(() =>
  import('./EditAttributeDialog').then((module) => ({
    default: module.EditAttributeDialog,
  })),
);

export const EditAttributeButton: FunctionComponent<
  EditAttributeDialogProps
> = (props) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditAttributeDialog, {
      resolve: props,
      formId: ATTRIBUTE_FORM_ID,
    });
  };
  return <CompactEditButton onClick={callback} />;
};
