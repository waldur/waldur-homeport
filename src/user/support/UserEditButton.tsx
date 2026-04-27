import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
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
  const dispatch = useDispatch();
  const isStaffUser = useSelector(isStaff);

  if (!isStaffUser) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Edit')}
      action={() =>
        dispatch(
          openModalDialog(UserFormDialog, {
            size: 'lg',
            resolve: { user: row, refetch },
          }),
        )
      }
      iconNode={<PencilSimpleIcon weight="bold" />}
      staff
      size="sm"
    />
  );
};
