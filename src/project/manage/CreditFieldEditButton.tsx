import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

import { EditProjectCreditProps } from '../types';

const EditCreditFieldDialog = lazyComponent(() =>
  import('./EditCreditFieldDialog').then((module) => ({
    default: module.EditCreditFieldDialog,
  })),
);

export const CreditFieldEditButton = (props: EditProjectCreditProps) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditCreditFieldDialog, { resolve: props });
  };
  return <CompactEditButton onClick={callback} />;
};
