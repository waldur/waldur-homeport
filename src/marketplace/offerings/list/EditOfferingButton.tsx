import { useCurrentStateAndParams } from '@uirouter/react';
import { Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { DropdownLink } from './DropdownLink';

export const EditOfferingButton = ({ row }) => {
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);

  const canUpdateOffering = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING,
    customerId: row.customer_uuid || customer.uuid,
  });

  const { state } = useCurrentStateAndParams();
  const targetState = isDescendantOf('admin', state)
    ? 'admin-marketplace-offering-update'
    : 'marketplace-offering-update';

  if (!canUpdateOffering) {
    return null;
  }

  return (
    <Dropdown.Item
      as={DropdownLink}
      state={targetState}
      params={{
        offering_uuid: row.uuid,
        uuid: row.customer_uuid || customer.uuid,
      }}
    >
      {translate('Edit')}
    </Dropdown.Item>
  );
};
