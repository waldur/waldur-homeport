import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import { openModalDialog } from '@waldur/modal/actions';

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
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditAttributeDialog, {
        resolve: props,
        formId: ATTRIBUTE_FORM_ID,
      }),
    );
  };
  return <CompactEditButton onClick={callback} />;
};
