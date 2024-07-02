import { PencilSimple } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

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
  return (
    <ActionButton
      action={callback}
      iconNode={<PencilSimple weight="bold" />}
      variant="secondary"
      className="btn-sm btn-icon"
    />
  );
};
