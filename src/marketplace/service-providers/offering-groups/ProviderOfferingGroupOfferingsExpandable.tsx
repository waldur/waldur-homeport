import { useMemo } from 'react';
import {
  marketplaceProviderOfferingsList,
  OfferingGroup,
  ProviderOffering,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

export const ProviderOfferingGroupOfferingsExpandable = ({
  group,
}: {
  group: OfferingGroup;
}) => {
  const filter = useMemo(
    () => ({ offering_group_uuid: group.uuid }),
    [group.uuid],
  );
  const tableProps = useTable({
    table: `marketplace-offering-group-${group.uuid}-offerings`,
    fetchData: createFetcher(marketplaceProviderOfferingsList),
    filter,
  });
  return (
    <Table<ProviderOffering>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          copyField: (row) => row.name,
        },
        {
          title: translate('Category'),
          render: ({ row }) => renderFieldOrDash(row.category_title),
        },
        {
          title: translate('Type'),
          render: ({ row }) => row.type,
        },
        {
          title: translate('State'),
          render: ({ row }) => row.state,
        },
        {
          title: translate('Resources'),
          render: ({ row }) => row.resources_count ?? 0,
        },
      ]}
      verboseName={translate('Offerings')}
      showPageSizeSelector={true}
      title={translate('Offerings')}
    />
  );
};
