import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

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

    const user = useSelector(getUser);
    const customer = useSelector(getCustomer);

    if (
      !hasPermission(user, {
        permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
        customerId: customer.uuid,
      })
    ) {
      return null;
    }

    return (
      <ActionButton
        action={callback}
        title={translate('Add organization member')}
        icon="fa fa-plus"
        variant="primary"
      />
    );
  };
