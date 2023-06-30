import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getCustomer as getCustomerSelector } from '@waldur/workspace/selectors';

export const OrganizationHoverableRow: FC<{ row }> = ({ row }) => {
  const currentOrganization = useSelector(getCustomerSelector);

  return currentOrganization?.uuid !== row.customer_uuid ? (
    <Link
      className="btn btn-light btn-active-primary min-w-90px pull-right"
      state="organization.dashboard"
      params={{ uuid: row.customer_uuid }}
    >
      {translate('Select')}
    </Link>
  ) : (
    <Button variant="secondary" disabled={true} className="pull-right">
      {translate('Selected')}
    </Button>
  );
};
