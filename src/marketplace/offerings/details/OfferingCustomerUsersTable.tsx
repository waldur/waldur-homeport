import { FunctionComponent } from 'react';
import { marketplaceProviderOfferingsListUsersList } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CustomerContactColumn } from '../../service-providers/CustomerContactColumn';

const UserNameColumn = ({ row }) => (
  <>
    <Link
      state="marketplace-provider-user-manage"
      params={{ user_uuid: row.uuid }}
      label={renderFieldOrDash(row.full_name)}
      className="fw-bold"
    />
    {row.organization ? (
      <p className="text-muted mb-0">{row.organization}</p>
    ) : null}
  </>
);

interface OfferingCustomerUsersTableProps {
  offering: Offering;
  tabs: any[];
}

export const OfferingCustomerUsersTable: FunctionComponent<
  OfferingCustomerUsersTableProps
> = ({ offering, tabs }) => {
  const usersTableProps = useTable({
    table: `offering-users-${offering.uuid}`,
    fetchData: createFetcher(marketplaceProviderOfferingsListUsersList, {
      path: { uuid: offering.uuid },
    }),
    queryField: 'query',
  });

  return (
    <Table
      {...usersTableProps}
      columns={[
        {
          title: translate('User'),
          render: UserNameColumn,
          ellipsis: true,
        },
        {
          title: translate('Contact'),
          render: CustomerContactColumn,
          ellipsis: true,
        },
      ]}
      tabs={tabs}
      showPageSizeSelector={true}
      verboseName={translate('users')}
      hasQuery={true}
    />
  );
};
