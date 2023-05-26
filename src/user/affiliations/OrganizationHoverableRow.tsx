import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getCustomer as getCustomerSelector } from '@waldur/workspace/selectors';

export const OrganizationHoverableRow: FC<{ row }> = ({ row }) => {
  const currentOrganization = useSelector(getCustomerSelector);

  return currentOrganization?.uuid !== row.uuid ? (
    <Link state="organization.dashboard" params={{ uuid: row.uuid }}>
      <Button
        variant="light"
        className="btn-active-primary min-w-90px pull-right"
        size="sm"
      >
        {translate('Select')}
      </Button>
    </Link>
  ) : (
    <Button
      variant="secondary"
      size="sm"
      disabled={true}
      className="pull-right"
    >
      {translate('Selected')}
    </Button>
  );
};
