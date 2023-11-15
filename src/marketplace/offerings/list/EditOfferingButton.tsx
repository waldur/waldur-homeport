import { useCurrentStateAndParams } from '@uirouter/react';
import { Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { getCustomer } from '@waldur/workspace/selectors';

import { DropdownLink } from './DropdownLink';

export const EditOfferingButton = ({ row }) => {
  const customer = useSelector(getCustomer);

  const { state } = useCurrentStateAndParams();
  const targetState = isDescendantOf('admin', state)
    ? 'admin.marketplace-offering-update'
    : 'marketplace-offering-update';

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
