import * as React from 'react';
import { compose } from 'redux';

import { withTranslation, translate } from '@waldur/i18n';
import { PlanUsageButton } from '@waldur/marketplace/resources/PlanUsageButton';
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
      title: translate('Limit'),
      render: ({ row }) => row.limit || 'N/A',
    },
    {
      title: translate('Active plan count'),
      render: ({ row }) => row.usage,
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
