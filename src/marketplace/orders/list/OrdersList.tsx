import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { useDestroyFilterOnLeave } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { Offering, ServiceProvider } from '@waldur/marketplace/types';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';
import { Customer, User } from '@waldur/workspace/types';

import { OrderProviderActions } from '../actions/OrderProviderActions';

import { TABLE_PUBLIC_ORDERS } from './constants';
import { OrderNameField } from './OrderNameField';
import { OrdersFilter } from './OrdersFilter';
import { OrderStateCell } from './OrderStateCell';
import { OrderTablePlaceholder } from './OrderTablePlaceholder';
import { OrderTypeCell } from './OrderTypeCell';
import { ResourceNameField } from './ResourceNameField';

export const OrdersList: FunctionComponent<{}> = () => {
  useDestroyFilterOnLeave('OrderFilter');
  const filter = useSelector(mapStateToFilter);

  const props = useTable({
    table: TABLE_PUBLIC_ORDERS,
    fetchData: createFetcher('marketplace-orders'),
    filter,
  });

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
      render: ({ row }) => <>{row.customer_name}</>,
    },
    {
      title: translate('Project'),
      render: ({ row }) => <>{row.project_name}</>,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
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
      filters={
        <OrdersFilter showOrganizationFilter={true} showOfferingFilter={true} />
      }
    />
  );
};

const mapStateToFilter = createSelector(
  getFormValues('OrderFilter'),
  getCustomer,
  isServiceManagerSelector,
  isOwnerOrStaffSelector,
  getUser,
  (
    filterValues: FormData,
    customer: Customer,
    isServiceManager: boolean,
    isOwnerOrStaff: boolean,
    user: User,
  ) => {
    const filter: Record<string, string> = {
      provider_uuid: customer.uuid,
    };
    if (filterValues) {
      if (filterValues.offering) {
        filter.offering_uuid = filterValues.offering.uuid;
      }
      if (filterValues.organization) {
        filter.customer_uuid = filterValues.organization.uuid;
      }
      if (filterValues.provider) {
        filter.provider_uuid = filterValues.provider.customer_uuid;
      }
      if (filterValues.state) {
        filter.state = filterValues.state.value;
      }
      if (filterValues.type) {
        filter.type = filterValues.type.value;
      }
    }
    if (isServiceManager && !isOwnerOrStaff) {
      filter.service_manager_uuid = user.uuid;
    }
    return filter;
  },
);

interface FormData {
  offering?: Offering;
  organization?: Customer;
  provider?: ServiceProvider;
  state?: { value: string };
  type?: { value: string };
}
