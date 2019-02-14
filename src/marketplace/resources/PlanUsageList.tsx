import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { withTranslation } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

export const TableComponent = props => {
  const { translate } = props;
  const columns = [
    {
      title: translate('Service provider'),
      render: ({ row }) => row.customer_provider_name,
    },
    {
      title: translate('Offering'),
      render: ({ row }) => row.offering_name,
    },
    {
      title: translate('Plan'),
      render: ({ row }) => row.plan_name,
    },
    {
      title: translate('Limit'),
      render: ({ row }) => row.limit || 'N/A',
    },
    {
      title: translate('Usage'),
      render: ({ row }) => row.usage,
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
    'Usage',
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
