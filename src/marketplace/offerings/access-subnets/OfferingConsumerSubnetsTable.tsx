import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useCallback, useEffect } from 'react';
import {
  Offering,
  OfferingAccessSubnetExpanded,
  marketplaceProviderOfferingsAccessSubnetsRetrieve,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableTab } from '@/table/types';
import { useTable } from '@/table/useTable';

import { OfferingAccessSubnetsAllowListButton } from './OfferingAccessSubnetsAllowListButton';

interface OfferingConsumerSubnetsTableProps {
  offering: Offering;
  tabs: TableTab[];
}

/**
 * Consumer-defined subnets scoped to this offering, one row per (organization,
 * address).
 *
 * Sourced from the offering's own aggregate action rather than the organization
 * subnet list: that list is scoped to the caller's own organizations, so a
 * service provider querying it would see nothing. The action applies the
 * provider permission check instead, which is the relationship that matters
 * here.
 */
export const OfferingConsumerSubnetsTable: FunctionComponent<
  OfferingConsumerSubnetsTableProps
> = ({ offering, tabs }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['offering-consumer-subnets', offering.uuid],
    queryFn: () =>
      marketplaceProviderOfferingsAccessSubnetsRetrieve({
        path: { uuid: offering.uuid },
      }),
  });

  const rows: OfferingAccessSubnetExpanded[] = data?.data?.expanded ?? [];
  const tableProps = useTable({
    table: `offeringConsumerAccessSubnets-${offering.uuid}`,
    fetchData: createClientPaginatedFetcher(rows),
  });
  // The fetcher closes over the rows: fetch again once they arrive, or the
  // table keeps its first, empty, result.
  useEffect(() => {
    tableProps.fetch();
  }, [data]);
  // Only Refresh and Retry (force) download the list again; paging, sorting
  // and search page the rows already held. Memoized: Table fetches again
  // whenever this changes identity, so an inline function refetches on
  // every render.
  const fetch = useCallback(
    (force?: boolean) => {
      if (force) {
        refetch();
      } else {
        tableProps.fetch();
      }
    },
    [refetch, tableProps.fetch],
  );

  return (
    <Table<OfferingAccessSubnetExpanded>
      {...tableProps}
      loading={isLoading}
      error={error}
      fetch={fetch}
      id="offering-consumer-access-subnets"
      title={translate('Access subnets')}
      tabs={tabs}
      columns={[
        {
          title: translate('CIDR'),
          render: ({ row }) => <>{row.inet}</>,
        },
        {
          title: translate('Organization'),
          render: ({ row }) => <>{row.customer_name}</>,
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{row.description}</>,
        },
      ]}
      verboseName={translate('consumer access subnets')}
      tableActions={
        <OfferingAccessSubnetsAllowListButton offeringUuid={offering.uuid} />
      }
    />
  );
};
