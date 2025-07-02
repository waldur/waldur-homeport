import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

import { EditCustomerCreditProps } from '../details/types';

const EditCreditFieldDialog = lazyComponent(() =>
  import('./EditCreditFieldDialog').then((module) => ({
    default: module.EditCreditFieldDialog,
  })),
);

export const CreditFieldEditButton = (
  props: EditCustomerCreditProps & { disabled? },
) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(openModalDialog(EditCreditFieldDialog, { resolve: props }));
  };
  return <EditButton onClick={callback} size="sm" disabled={props.disabled} />;
};
