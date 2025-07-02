import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { Dropdown } from 'react-bootstrap';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';

import { DropdownLink } from './DropdownLink';

export const EditOfferingButton = ({
  row,
}: {
  row: ProviderOfferingDetails;
}) => {
  const user = useUser();

  const canUpdateOffering = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING,
    customerId: row.customer_uuid,
  });

  const { state } = useCurrentStateAndParams();
  const targetState =
    state.data?.workspace === 'admin'
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
        uuid: row.customer_uuid,
      }}
    >
      <span className="svg-icon svg-icon-2">
        <PencilSimpleIcon weight="bold" />
      </span>
      {translate('Edit')}
    </Dropdown.Item>
  );
};
