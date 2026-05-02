import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

import { EditCustomerCreditProps } from '../details/types';

const EditCreditFieldDialog = lazyComponent(() =>
  import('./EditCreditFieldDialog').then((module) => ({
    default: module.EditCreditFieldDialog,
  })),
);

export const CreditFieldEditButton = (
  props: EditCustomerCreditProps & { disabled? },
) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditCreditFieldDialog, { resolve: props });
  };
  return <CompactEditButton onClick={callback} disabled={props.disabled} />;
};
