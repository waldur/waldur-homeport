import { FC } from 'react';
import { marketplaceOfferingProfilesList } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CreateProfileAction } from './CreateProfileAction';
import { OfferingProfilesRowActions } from './OfferingProfilesRowActions';

export const OfferingProfilesList: FC = () => {
  const tableProps = useTable({
    table: 'OfferingProfilesList',
    fetchData: createFetcher(marketplaceOfferingProfilesList),
  });

  return (
    <Table
      {...tableProps}
      title={translate('Service profiles')}
      verboseName={translate('service profiles')}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => (
            <Link
              state="admin-marketplace-offering-profile-detail"
              params={{ uuid: row.uuid }}
            >
              {row.name}
            </Link>
          ),
          keys: ['name'],
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.description),
          keys: ['description'],
        },
        {
          title: translate('Roles'),
          render: ({ row }) => (row.roles || []).length,
        },
        {
          title: translate('Offerings'),
          render: ({ row }) => row.offerings_count ?? 0,
        },
      ]}
      rowActions={({ row }) => (
        <OfferingProfilesRowActions row={row} refetch={tableProps.fetch} />
      )}
      tableActions={<CreateProfileAction refetch={tableProps.fetch} />}
    />
  );
};
