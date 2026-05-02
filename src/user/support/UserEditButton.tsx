import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { isStaff } from '@/workspace/selectors';

const UserFormDialog = lazyComponent(() =>
  import('./UserFormDialog').then((module) => ({
    default: module.UserFormDialog,
  })),
);

export const UserEditButton: FunctionComponent<{ row; refetch? }> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  const isStaffUser = useSelector(isStaff);

  if (!isStaffUser) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Edit')}
      action={() =>
        openDialog(UserFormDialog, {
          size: 'lg',
          resolve: { user: row, refetch },
        })
      }
      iconNode={<PencilSimpleIcon weight="bold" />}
      staff
      size="sm"
    />
  );
};
