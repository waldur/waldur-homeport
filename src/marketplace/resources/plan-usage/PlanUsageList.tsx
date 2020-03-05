import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { withTranslation } from '@waldur/i18n';
import { PlanRemainingColumn } from '@waldur/marketplace/common/PlanRemainingColumn';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

import { PlanUsageButton } from './PlanUsageButton';
import { PlanUsageRowProps } from './types';

export const TableComponent = props => {
  const { translate } = props;
  const columns = [
    {
      title: translate('Service provider'),
      render: ({ row }: PlanUsageRowProps) => row.customer_provider_name,
    },
    {
      title: translate('Offering'),
      render: ({ row }: PlanUsageRowProps) => row.offering_name,
    },
    {
      title: translate('Plan'),
      render: ({ row }: PlanUsageRowProps) => row.plan_name,
    },
    {
      title: translate('Active count'),
      render: ({ row }: PlanUsageRowProps) => row.usage,
      orderField: 'usage',
    },
    {
      title: translate('Limit'),
      render: ({ row }: PlanUsageRowProps) => row.limit || 'N/A',
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
      verboseName={translate('plans')}
      showPageSizeSelector={true}
      enableExport={true}
      initialSorting={{ field: 'usage', mode: 'desc' }}
    />
  );
};

const TableOptions = {
  table: 'PlanUsages',
  fetchData: createFetcher('marketplace-plans/usage_stats'),
  mapPropsToFilter: props => {
    const filter: Record<string, string> = {};
    if (props.filter) {
      if (props.filter.provider) {
        filter.customer_provider_uuid = props.filter.provider.customer_uuid;
      }
      if (props.filter.offering) {
        filter.offering_uuid = props.filter.offering.uuid;
      }
    }
    return filter;
  },

  exportRow: row => [
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
};

const mapStateToProps = state => ({
  filter: getFormValues('PlanUsageFilter')(state),
});

const connector = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
  withTranslation,
);

export const PlanUsageList = connector(TableComponent);
