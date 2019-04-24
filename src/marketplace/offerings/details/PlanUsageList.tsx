import * as React from 'react';
import { compose } from 'redux';

import { withTranslation, translate } from '@waldur/i18n';
import { PlanRemainingColumn } from '@waldur/marketplace/common/PlanRemainingColumn';
import { PlanUsageButton } from '@waldur/marketplace/resources/plan-usage/PlanUsageButton';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

interface PlanUsageListProps {
  offering_uuid: string;
}

export const TableComponent = props => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => row.plan_name,
    },
    {
      title: translate('Active count'),
      render: ({ row }) => row.usage,
      orderField: 'usage',
    },
    {
      title: translate('Limit'),
      render: ({ row }) => row.limit || 'N/A',
      orderField: 'limit',
    },
    {
      title: translate('Remaining'),
      render: PlanRemainingColumn,
      orderField: 'remaining',
    },
    {
      title: translate('Actions'),
      render: PlanUsageButton,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('offerings')}
      showPageSizeSelector={true}
      enableExport={true}
      initialSorting={{field: 'usage', mode: 'desc'}}
    />
  );
};

const TableOptions = {
  table: 'OfferingPlans',
  fetchData: createFetcher('marketplace-plans/usage_stats'),
  mapPropsToFilter: props => ({
    offering_uuid: props.offering_uuid,
  }),
  verboseName: translate('plans'),
  exportRow: row => [
    row.plan_name,
    row.limit,
    row.usage,
  ],
  exportFields: [
    'Plan',
    'Limit',
    'Active plan count',
  ],
};

const connector = compose(
  connectTable(TableOptions),
  withTranslation,
);

export const PlanUsageList = connector(TableComponent) as React.ComponentType<PlanUsageListProps>;
