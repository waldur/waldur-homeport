import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { AttachManagedProjectDialog } from './AttachManagedProjectDialog';

export const AttachManagedProjectButton: FC<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const project = row; // Assuming row is the project object

  if (!project) {
    return null;
  }

  const { openDialog } = useModal();
  const callback = () =>
    openDialog(AttachManagedProjectDialog, {
      project: project,
      title: translate('Attach Project'),
      dialogClassName: 'modal-dialog-centered',
      resolve: {
        refetch,
      },
      size: 'lg',
    });

  return (
    <ActionItem
      title={translate('Attach Project')}
      action={callback}
      size="sm"
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};
