import { useMemo } from 'react';
import { MarketplaceComponentUsagesListData } from 'waldur-js-client';

import { formatMonth } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

export const ResourceComponentUsageTable = (props) => {
  const filter = useMemo(() => {
    const result: MarketplaceComponentUsagesListData['query'] = {
      resource_uuid: props.resource.resource_uuid,
    };
    return result;
  }, [props.resource]);

  const tableProps = useTable({
    table: 'ResourceUsageTable',
    fetchData: createFetcher('marketplace-component-usages'),
    filter,
  });
  const columns = [
    {
      title: translate('Billing period'),
      render: ({ row }) => <>{formatMonth(row.date)}</>,
      orderField: 'billing_period',
    },
    {
      title: translate('Usage'),
      render: ({ row }) => <>{row.usage}</>,
      orderField: 'usage',
    },
  ].filter(Boolean);

  return <Table {...tableProps} columns={columns} />;
};
