import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { openModalDialog } from '@/modal/actions';

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
  return <CompactEditButton onClick={callback} disabled={props.disabled} />;
};
