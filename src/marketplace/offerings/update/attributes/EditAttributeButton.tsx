import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

import { ATTRIBUTE_FORM_ID } from './constants';
import { EditAttributeDialogProps } from './types';

const EditAttributeDialog = lazyComponent(
  () => import('./EditAttributeDialog'),
  'EditAttributeDialog',
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
  return <EditButton onClick={callback} size="sm" />;
};
