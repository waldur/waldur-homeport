import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { MarketplaceComponentUserUsagesListData } from 'waldur-js-client';

import { formatMonth } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ResourceUsageFilter } from './ResourceUsageFilter';

export const ResourceComponentUserUsageTable = (props) => {
  const filterForm: any = useSelector(getFormValues('ResourceUsageFilterForm'));

  const filter = useMemo(() => {
    const result: MarketplaceComponentUserUsagesListData['query'] = {
      username: filterForm?.username,
      billing_period_month: filterForm?.billing_period?.value.month,
      billing_period_year: filterForm?.billing_period?.value.year,
      resource_uuid: props.resource.resource_uuid,
    };
    return result;
  }, [
    props.resource.resource_uuid,
    filterForm?.username,
    filterForm?.billing_period,
  ]);

  const tableProps = useTable({
    table: 'ResourceUsageTable',
    fetchData: createFetcher('marketplace-component-user-usages'),
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
      render: ({ row }) => <>{row.usage}</>,
      orderField: 'usage',
    },
  ].filter(Boolean);

  return (
    <Table
      {...tableProps}
      columns={columns}
      filters={<ResourceUsageFilter />}
    />
  );
};
