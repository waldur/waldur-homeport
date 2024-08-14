import { PlusCircle } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

const GlobalProjectCreateDialog = lazyComponent(
  () => import('./GlobalProjectCreateDialog'),
  'GlobalProjectCreateDialog',
);

export const GlobalProjectCreateButton: FC<{ refetch }> = ({ refetch }) => {
  const user = useSelector(getUser);
  const disabled =
    !user.is_staff &&
    user.permissions
      .filter((perm) => perm.scope_type === 'customer')
      .every(
        (perm) =>
          !hasPermission(user, {
            permission: PermissionEnum.CREATE_PROJECT,
            customerId: perm.scope_uuid,
          }),
      );
  const dispatch = useDispatch();
  if (disabled) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Add')}
      action={() =>
        dispatch(
          openModalDialog(GlobalProjectCreateDialog, {
            refetch,
          }),
        )
      }
      iconNode={<PlusCircle />}
      variant="primary"
    />
  );
};
