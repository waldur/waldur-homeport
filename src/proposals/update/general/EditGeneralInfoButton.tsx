import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';
import { EditCallProps } from '@/proposals/types';

const EditGeneralInfoDialog = lazyComponent(() =>
  import('./EditGeneralInfoDialog').then((module) => ({
    default: module.EditGeneralInfoDialog,
  })),
);

export const EditGeneralInfoButton = (props: EditCallProps) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditGeneralInfoDialog, {
      resolve: props,
      size: 'lg',
    });
  };
  return <CompactEditButton onClick={callback} variant="secondary" />;
};
