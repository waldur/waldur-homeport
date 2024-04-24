import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { PlanRemainingColumn } from '@waldur/marketplace/common/PlanRemainingColumn';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { PlanUsageButton } from './PlanUsageButton';
import { PlanUsageFilter } from './PlanUsageFilter';
import { PlanUsageRowProps } from './types';

export const PlanUsageList: FunctionComponent = () => {
  const filter = useSelector(mapStateToProps);
  const props = useTable({
    table: 'PlanUsages',
    fetchData: createFetcher('marketplace-plans/usage_stats'),
    exportRow: (row) => [
      row.customer_provider_name,
      row.offering_name,
      row.plan_name,
      row.limit,
      row.usage,
    ],
    exportFields: [
      'Service provider',
      'Offering',
      'Plan',
      'Limit',
      'Active plan count',
    ],
    filter,
  });
  const columns = [
    {
      title: translate('Service provider'),
      render: ({ row }: PlanUsageRowProps) => <>{row.customer_provider_name}</>,
    },
    {
      title: translate('Offering'),
      render: ({ row }: PlanUsageRowProps) => <>{row.offering_name}</>,
    },
    {
      title: translate('Plan'),
      render: ({ row }: PlanUsageRowProps) => <>{row.plan_name}</>,
    },
    {
      title: translate('Active count'),
      render: ({ row }: PlanUsageRowProps) => <>{row.usage}</>,
      orderField: 'usage',
    },
    {
      title: translate('Limit'),
      render: ({ row }: PlanUsageRowProps) => <>{row.limit || 'N/A'}</>,
      orderField: 'limit',
    },
    {
      title: translate('Remaining'),
      render: PlanRemainingColumn,
      orderField: 'remaining',
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('plans')}
      showPageSizeSelector={true}
      enableExport={true}
      initialSorting={{ field: 'usage', mode: 'desc' }}
      hoverableRow={PlanUsageButton}
      filters={<PlanUsageFilter />}
    />
  );
};

const mapStateToProps = createSelector(
  getFormValues('PlanUsageFilter'),
  (filterValues: any) => {
    const filter: Record<string, string> = {};
    if (filterValues) {
      if (filterValues.provider) {
        filter.customer_provider_uuid = filterValues.provider.customer_uuid;
      }
      if (filterValues.offering) {
        filter.offering_uuid = filterValues.offering.uuid;
      }
    }
    return filter;
  },
);
