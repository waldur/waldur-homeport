import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { isStaff } from '@waldur/workspace/selectors';

const UserFormDialog = lazyComponent(() =>
  import('./CreateUserDialog').then((module) => ({
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
