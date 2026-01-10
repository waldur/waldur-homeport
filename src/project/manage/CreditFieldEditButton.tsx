import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import { openModalDialog } from '@waldur/modal/actions';

import { EditProjectCreditProps } from '../types';

const EditCreditFieldDialog = lazyComponent(() =>
  import('./EditCreditFieldDialog').then((module) => ({
    default: module.EditCreditFieldDialog,
  })),
);

export const CreditFieldEditButton = (props: EditProjectCreditProps) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(openModalDialog(EditCreditFieldDialog, { resolve: props }));
  };
  return <CompactEditButton onClick={callback} />;
};
