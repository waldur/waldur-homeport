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
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { TABLE_PUBLIC_ORDERS } from './constants';
import { OrderItemApproveButton } from './OrderItemApproveButton';
import { OrderItemRejectButton } from './OrderItemRejectButton';
import { OrderItemslistTablePlaceholder } from './OrderItemsListPlaceholder';
import { ResourceNameField } from './ResourceNameField';
import { RowNameField } from './RowNameField';

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Offering'),
      render: RowNameField,
    },
    {
      title: translate('Resource'),
      render: ResourceNameField,
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('Type'),
      render: ({ row }) => row.type,
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
      title: translate('Actions'),
      render: ({ row }) =>
        row.state === 'done' ? null : (
          <>
            {row.state === 'executing' && (
              <OrderItemApproveButton uuid={row.uuid} />
            )}
            {row.state !== 'terminated' && row.state !== 'terminating' && (
              <OrderItemRejectButton uuid={row.uuid} />
            )}
          </>
        ),
    },
  ];

  return (
    <Table
      {...props}
      placeholderComponent={<OrderItemslistTablePlaceholder />}
      columns={columns}
      verboseName={translate('Order items')}
      initialSorting={{ field: 'created', mode: 'desc' }}
    />
  );
};

const OrderItemsListTableOptions = {
  table: TABLE_PUBLIC_ORDERS,
  fetchData: createFetcher('marketplace-order-items'),
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
    if (props.isServiceManager) {
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
  filter: getFormValues('OrderItemFilter')(state) as FormData,
  customer: getCustomer(state),
  user: getUser(state),
  isServiceManager: isServiceManagerSelector(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(OrderItemsListTableOptions),
);

export const OrderItemsList = enhance(TableComponent);
