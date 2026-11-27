import { FC, useMemo } from 'react';
import {
  marketplaceComponentUsagesList,
  MarketplaceComponentUsagesListData,
  OfferingComponent,
  Resource,
} from 'waldur-js-client';

import { formatMonth } from '@/core/dateUtils';
import { formatUsageValue } from '@/core/formatNumber';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

import { getMissingUsagePolicyLabel } from './missingUsagePolicy';
import { getDisplayUnit } from './utils';

export const ResourceComponentUsageTable: FC<
  TableWithPortal<{
    resource: Pick<Resource, 'uuid'>;
    offeringComponent?: Pick<OfferingComponent, 'type'> &
      Partial<
        Pick<OfferingComponent, 'measured_unit' | 'billing_type' | 'factor'>
      >;
    offeringType?: string;
  }>
> = ({ portal, ...props }) => {
  const filter = useMemo(() => {
    const result: MarketplaceComponentUsagesListData['query'] = {
      resource_uuid: props.resource.uuid,
    };
    if (props.offeringComponent?.type) {
      result.type = props.offeringComponent.type;
    }
    return result;
  }, [props.resource.uuid, props.offeringComponent?.type]);

  const tableProps = useTable({
    table: 'ResourceUsageTable',
    fetchData: createFetcher(marketplaceComponentUsagesList),
    filter,
  });
  const factor = props.offeringComponent?.factor || 1;
  const unit = getDisplayUnit(
    props.offeringComponent?.measured_unit,
    props.offeringComponent?.factor,
    props.offeringType,
  );
  // Limit-based components report the highest amount held during the month.
  const usageTitle =
    props.offeringComponent?.billing_type === 'limit'
      ? translate('Monthly peak')
      : translate('Usage');
  const columns = [
    {
      title: translate('Billing period'),
      render: ({ row }) => <>{formatMonth(row.billing_period)}</>,
      orderField: 'billing_period',
    },
    {
      title: unit ? `${usageTitle} (${unit})` : usageTitle,
      render: ({ row }) => (
        <>{formatUsageValue(Number(row.usage) / factor, false, 2)}</>
      ),
      orderField: 'usage',
    },
    {
      title: translate('Missing usage policy'),
      render: ({ row }) => (
        <>{getMissingUsagePolicyLabel(row.missing_usage_policy)}</>
      ),
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
