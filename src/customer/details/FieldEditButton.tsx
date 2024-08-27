import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

import { EditCustomerProps } from './types';

const EditFieldDialog = lazyComponent(
  () => import('./EditFieldDialog'),
  'EditFieldDialog',
);

export const FieldEditButton = (props: EditCustomerProps) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditFieldDialog, {
        resolve: props,
      }),
    );
  };
  return <EditButton onClick={callback} size="sm" />;
};
