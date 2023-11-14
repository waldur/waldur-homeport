import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { getCustomer } from '@waldur/workspace/selectors';

export const EditOfferingButton = ({ row }) => {
  const router = useRouter();
  const customer = useSelector(getCustomer);

  const { state } = useCurrentStateAndParams();
  const targetState = isDescendantOf('admin', state)
    ? 'admin.marketplace-offering-update'
    : 'marketplace-offering-update';

  return (
    <Dropdown.Item
      as="button"
      onClick={() => {
        router.stateService.go(targetState, {
          offering_uuid: row.uuid,
          uuid: row.customer_uuid || customer.uuid,
        });
      }}
    >
      {translate('Edit')}
    </Dropdown.Item>
  );
};
