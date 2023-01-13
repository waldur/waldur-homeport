import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { OrderItemActionsCell } from '@waldur/marketplace/orders/item/list/OrderItemActionsCell';
import { OrderItemslistTablePlaceholder } from '@waldur/marketplace/orders/item/list/OrderItemsListPlaceholder';
import { OrderItemStateCell } from '@waldur/marketplace/orders/item/list/OrderItemStateCell';
import { OrderItemTypeCell } from '@waldur/marketplace/orders/item/list/OrderItemTypeCell';
import { ResourceNameField } from '@waldur/marketplace/orders/item/list/ResourceNameField';
import { Offering } from '@waldur/marketplace/types';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { renderFieldOrDash } from '@waldur/table/utils';

import { TABLE_OFFERING_ORDER_ITEMS } from './constants';

interface OwnProps {
  offering: Offering;
}
interface OfferingOrderItemsFilter {
  state?: { value: string };
  type?: { value: string };
}
interface StateProps {
  filter: OfferingOrderItemsFilter;
}

const OrderItemsTable: FunctionComponent<any> = (props) => {
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
      render: OrderItemTypeCell,
    },
    {
      title: translate('State'),
      render: OrderItemStateCell,
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
      placeholderComponent={<OrderItemslistTablePlaceholder />}
      columns={columns}
      title={translate('Order items')}
      verboseName={translate('Order items')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      initialPageSize={5}
      hoverableRow={OrderItemActionsCell}
    />
  );
};

const OrderItemsListTableOptions = {
  table: TABLE_OFFERING_ORDER_ITEMS,
  fetchData: createFetcher('marketplace-order-items'),
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
  filter: getFormValues('OrderItemFilter')(state) as OfferingOrderItemsFilter,
});

const enhance = compose(
  connect<StateProps, {}, OwnProps>(mapStateToProps),
  connectTable(OrderItemsListTableOptions),
);

export const OfferingOrderItemsList = enhance(
  OrderItemsTable,
) as React.ComponentType<any>;
