import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { AttachManagedProjectDialog } from './AttachManagedProjectDialog';

export const AttachManagedProjectButton: FC<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const project = row; // Assuming row is the project object

  if (!project) {
    return null;
  }

  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(AttachManagedProjectDialog, {
        project: project,
        title: translate('Attach Project'),
        dialogClassName: 'modal-dialog-centered',
        resolve: {
          refetch,
        },
        size: 'lg',
      }),
    );

  return (
    <ActionItem
      title={translate('Attach Project')}
      action={callback}
      size="sm"
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};
