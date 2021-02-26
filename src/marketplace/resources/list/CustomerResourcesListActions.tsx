import React, { FunctionComponent } from 'react';
import { DropdownButton } from 'react-bootstrap';
import { useBoolean } from 'react-use';

import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { ResourceShowUsageButton } from '@waldur/marketplace/resources/usage/ResourceShowUsageButton';

interface CustomerResourcesListActionsProps {
  row: Resource;
}

export const CustomerResourcesListActions: FunctionComponent<CustomerResourcesListActionsProps> = ({
  row,
}) => {
  const [open, onToggle] = useBoolean(false);
  return (
    <DropdownButton
      title={translate('Actions')}
      id="customer-resources-actions-dropdown-btn"
      className="dropdown-btn"
      onToggle={onToggle}
      open={open}
      disabled={!row.is_usage_based}
    >
      <ResourceShowUsageButton
        resource={row}
        offeringUuid={row.offering_uuid}
        resourceUuid={row.uuid}
      />
    </DropdownButton>
  );
};
