import { FC, useMemo } from 'react';
import {
  marketplaceComponentUsagesList,
  MarketplaceComponentUsagesListData,
} from 'waldur-js-client';

import { formatMonth } from '@waldur/core/dateUtils';
import { formatUsageValue } from '@waldur/core/formatNumber';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

export const ResourceComponentUsageTable: FC<TableWithPortal<any>> = ({
  portal,
  ...props
}) => {
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
      render: ({ row }) => <>{formatUsageValue(row.usage)}</>,
      orderField: 'usage',
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
