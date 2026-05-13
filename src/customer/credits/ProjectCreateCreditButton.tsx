import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

const ProjectCreditDialog = lazyComponent(() =>
  import('./ProjectCreditDialog').then((module) => ({
    default: module.ProjectCreditDialog,
  })),
);

export const ProjectCreateCreditButton = ({ refetch }) => {
  const { openDialog } = useModal();
  const openFormDialog = () =>
    openDialog(ProjectCreditDialog, {
      size: 'lg',
      resolve: { refetch },
    });
  return <AddButton action={openFormDialog} />;
};
