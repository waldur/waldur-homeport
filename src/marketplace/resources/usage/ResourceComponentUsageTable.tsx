import { useMemo } from 'react';
import {
  marketplaceComponentUsagesList,
  MarketplaceComponentUsagesListData,
} from 'waldur-js-client';

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
    if (props.offeringComponent?.type) {
      result.type = props.offeringComponent.type;
    }
    return result;
  }, [props.resource.resource_uuid, props.offeringComponent?.type]);

  const tableProps = useTable({
    table: 'ResourceUsageTable',
    fetchData: createFetcher(marketplaceComponentUsagesList),
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
