import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Offering, ServiceProvider } from '@waldur/marketplace/types';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { renderFieldOrDash } from '@waldur/table/utils';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { OrderProviderActions } from '../actions/OrderProviderActions';

import { TABLE_PUBLIC_ORDERS } from './constants';
import { OrderNameField } from './OrderNameField';
import { OrderStateCell } from './OrderStateCell';
import { OrderTablePlaceholder } from './OrderTablePlaceholder';
import { OrderTypeCell } from './OrderTypeCell';
import { ResourceNameField } from './ResourceNameField';

const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Offering'),
      render: OrderNameField,
    },
    {
      title: translate('Resource'),
      render: ResourceNameField,
    },
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
      title: translate('Plan'),
      render: ({ row }) => renderFieldOrDash(row.plan_name),
    },
  ];

  return (
    <Table
      {...props}
      placeholderComponent={<OrderTablePlaceholder />}
      columns={columns}
      title={translate('Orders')}
      verboseName={translate('Orders')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hoverableRow={({ row }) => (
        <OrderProviderActions row={row} refetch={props.fetch} />
      )}
      fullWidth={true}
    />
  );
};

const OrdersListTableOptions = {
  table: TABLE_PUBLIC_ORDERS,
  fetchData: createFetcher('marketplace-orders'),
  mapPropsToFilter: (props: StateProps) => {
    const filter: Record<string, string> = {
      provider_uuid: props.customer.uuid,
    };
    if (props.filter) {
      if (props.filter.offering) {
        filter.offering_uuid = props.filter.offering.uuid;
      }
      if (props.filter.organization) {
        filter.customer_uuid = props.filter.organization.uuid;
      }
      if (props.filter.provider) {
        filter.provider_uuid = props.filter.provider.customer_uuid;
      }
      if (props.filter.state) {
        filter.state = props.filter.state.value;
      }
      if (props.filter.type) {
        filter.type = props.filter.type.value;
      }
    }
    if (props.isServiceManager && !props.isOwnerOrStaff) {
      filter.service_manager_uuid = props.user.uuid;
    }
    return filter;
  },
};

interface FormData {
  offering?: Offering;
  organization?: Customer;
  provider?: ServiceProvider;
  state?: { value: string };
  type?: { value: string };
}

type StateProps = Readonly<ReturnType<typeof mapStateToProps>>;

const mapStateToProps = (state: RootState) => ({
  filter: getFormValues('OrderFilter')(state) as FormData,
  customer: getCustomer(state),
  user: getUser(state),
  isServiceManager: isServiceManagerSelector(state),
  isOwnerOrStaff: isOwnerOrStaff(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(OrdersListTableOptions),
);

export const OrdersList = enhance(TableComponent) as React.ComponentType<any>;
