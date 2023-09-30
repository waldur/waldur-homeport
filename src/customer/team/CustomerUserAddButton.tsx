import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RoleEnum } from '@waldur/permissions/enums';
import { formatRole } from '@waldur/permissions/utils';
import { ActionButton } from '@waldur/table/ActionButton';

const CustomerUserAddDialog = lazyComponent(
  () => import('./CustomerUserAddDialog'),
  'CustomerUserAddDialog',
);

interface CustomerUserAddButtonProps {
  refetch;
}

export const CustomerUserAddButton: FunctionComponent<CustomerUserAddButtonProps> =
  ({ refetch }) => {
    const dispatch = useDispatch();
    const callback = () =>
      dispatch(
        openModalDialog(CustomerUserAddDialog, { resolve: { refetch } }),
      );

    return (
      <ActionButton
        action={callback}
        title={translate('Add {role}', {
          role: formatRole(RoleEnum.CUSTOMER_OWNER),
        })}
        icon="fa fa-plus"
        variant="primary"
      />
    );
  };
