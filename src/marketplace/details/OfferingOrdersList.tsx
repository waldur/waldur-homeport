import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { OrderProviderActions } from '@waldur/marketplace/orders/actions/OrderProviderActions';
import { OrderStateCell } from '@waldur/marketplace/orders/list/OrderStateCell';
import { OrderTypeCell } from '@waldur/marketplace/orders/list/OrderTypeCell';
import { ResourceNameField } from '@waldur/marketplace/orders/list/ResourceNameField';
import { Offering } from '@waldur/marketplace/types';
import { OrderExpandableRow } from '@waldur/navigation/header/confirmation-drawer/OrderExpandableRow';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { renderFieldOrDash } from '@waldur/table/utils';

import { TABLE_OFFERING_ORDERS } from './constants';

interface OwnProps {
  offering: Offering;
}
interface OfferingOrderFilter {
  state?: { value: string };
  type?: { value: string };
}
interface StateProps {
  filter: OfferingOrderFilter;
}

const OrdersTable: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Resource'),
      render: ResourceNameField,
    },
    {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('Type'),
      render: OrderTypeCell,
    },
    {
      title: translate('State'),
      render: OrderStateCell,
    },
    {
      title: translate('Cost'),
      render: ({ row }) => defaultCurrency(row.cost),
    },
    {
      title: translate('Plan'),
      render: ({ row }) => renderFieldOrDash(row.plan_name),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      title={translate('Orders')}
      verboseName={translate('Orders')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      initialPageSize={5}
      hoverableRow={OrderProviderActions}
      expandableRow={OrderExpandableRow}
      hasPagination={true}
    />
  );
};

const OfferingOrdersListOptions = {
  table: TABLE_OFFERING_ORDERS,
  fetchData: createFetcher('marketplace-orders'),
  mapPropsToFilter: (props: StateProps & OwnProps) => {
    const filter: Record<string, string> = {
      offering_uuid: props.offering.uuid,
    };
    if (props.filter) {
      if (props.filter.state) {
        filter.state = props.filter.state.value;
      }
      if (props.filter.type) {
        filter.type = props.filter.type.value;
      }
    }
    return filter;
  },
};

const mapStateToProps = (state: RootState): StateProps => ({
  filter: getFormValues('OrderFilter')(state) as OfferingOrderFilter,
});

const enhance = compose(
  connect<StateProps, {}, OwnProps>(mapStateToProps),
  connectTable(OfferingOrdersListOptions),
);

export const OfferingOrdersList = enhance(
  OrdersTable,
) as React.ComponentType<any>;
