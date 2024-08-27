import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

import { EditProjectProps } from '../types';

const EditFieldDialog = lazyComponent(
  () => import('./EditFieldDialog'),
  'EditFieldDialog',
);

export const FieldEditButton = (props: EditProjectProps) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditFieldDialog, {
        resolve: props,
        size: 'sm',
      }),
    );
  };
  return <EditButton onClick={callback} size="sm" />;
};
