import * as React from 'react';
import { compose } from 'redux';

import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/services';
import { withTranslation } from '@waldur/i18n';
import { TABLE_NAME } from '@waldur/marketplace/offerings/store/constants';
import { connectAngularComponent } from '@waldur/store/connect';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { renderFieldOrDash } from '@waldur/table-react/utils';

export const TableComponent = props => {
  const { translate } = props;

  const columns = [
    {
      title: translate('Organization'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDate(row.created),
    },
    {
      title: translate('State'),
      render: ({ row }) => row.state,
    },
    {
      title: translate('Plan'),
      render: ({ row }) => renderFieldOrDash(row.plan_name),
    },
    {
      title: translate('Cost'),
      render: ({ row }) => defaultCurrency(row.cost),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Order items')}
    />
  );
};

const TableOptions = {
  table: TABLE_NAME,
  fetchData: createFetcher('marketplace-order-items'),
  mapPropsToFilter: props => ({
    offering_uuid: props.offering_uuid,
  }),
};

const enhance = compose(
  connectTable(TableOptions),
  withTranslation,
);

export const OfferingOrderItems: React.SFC<{offering_uuid: string}> = enhance(TableComponent);

export default connectAngularComponent(OfferingOrderItems);
