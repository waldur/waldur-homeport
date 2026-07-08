import { FC, useMemo } from 'react';
import {
  marketplaceComponentUserUsagesList,
  MarketplaceComponentUserUsagesListData,
  OfferingComponent,
  Resource,
} from 'waldur-js-client';

import { formatMonth } from '@/core/dateUtils';
import { formatUsageValue } from '@/core/formatNumber';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import {
  ResourceUsageFilter,
  RESOURCE_USAGE_FILTER_FORM_ID,
} from './ResourceUsageFilter';

export const ResourceComponentUserUsageTable: FC<
  TableWithPortal<{
    resource: Pick<Resource, 'uuid'>;
    offeringComponent: Pick<
      OfferingComponent,
      'type' | 'name' | 'measured_unit'
    >;
  }>
> = ({ portal, ...props }) => {
  const values = useFilterValues('ResourceUsageTable');
  const filterForm = values;

  const filter = useMemo(() => {
    const result: MarketplaceComponentUserUsagesListData['query'] = {
      username: filterForm?.username,
      billing_period_month: filterForm?.billing_period?.value?.month,
      billing_period_year: filterForm?.billing_period?.value?.year,
      resource_uuid: props.resource.uuid,
    };
    if (props.offeringComponent?.type) {
      result.type = props.offeringComponent.type;
    }
    return result;
  }, [
    props.resource.uuid,
    filterForm?.username,
    filterForm?.billing_period,
    props.offeringComponent?.type,
  ]);

  const tableProps = useTable({
    table: 'ResourceUsageTable',
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplaceComponentUserUsagesList),
    filter,
  });
  const columns = [
    {
      title: translate('Username'),
      render: ({ row }) => <>{row.username}</>,
      filter: 'username',
      orderField: 'username',
    },
    {
      title: translate('Date'),
      render: ({ row }) => <>{formatMonth(row.date)}</>,
      filter: 'billing_period',
      orderField: 'component_usage__billing_period',
    },
    {
      title: `${props.offeringComponent.name} / ${props.offeringComponent.measured_unit}`,
      render: ({ row }) => <>{formatUsageValue(row.usage)}</>,
      orderField: 'usage',
    },
  ].filter(Boolean);

  return (
    <Table
      {...tableProps}
      columns={columns}
      filters={<ResourceUsageFilter />}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
      formId={RESOURCE_USAGE_FILTER_FORM_ID}
    />
  );
};
