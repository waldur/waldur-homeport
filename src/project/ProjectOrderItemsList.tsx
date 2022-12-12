import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { OrderItemStateCell } from '@waldur/marketplace/orders/item/list/OrderItemStateCell';
import { OrderItemTypeCell } from '@waldur/marketplace/orders/item/list/OrderItemTypeCell';
import { RowNameField } from '@waldur/marketplace/orders/item/list/RowNameField';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { renderFieldOrDash } from '@waldur/table/utils';
import {
  getProject,
  getUser,
  isOwnerOrStaff,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Offering'),
      render: RowNameField,
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
      title: translate('Plan'),
      render: ({ row }) => renderFieldOrDash(row.plan_name),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasActionBar={false}
      hasHeaders={false}
      hasPagination={false}
      fullWidth={true}
    />
  );
};

const TableOptions = {
  table: 'ProjectOrderItemsList',
  fetchData: createFetcher('marketplace-order-items'),
  getDefaultFilter: () => ({
    page_size: 3,
    field: [
      'uuid',
      'customer_uuid',
      'project_uuid',
      'offering_name',
      'created',
      'type',
      'state',
      'plan_name',
    ],
  }),
  mapPropsToFilter: (props: StateProps) => {
    const filter: Record<string, string> = {
      project_uuid: props.project.uuid,
    };
    if (props.isServiceManager && !props.isOwnerOrStaff) {
      filter.service_manager_uuid = props.user.uuid;
    }
    return filter;
  },
};

type StateProps = Readonly<ReturnType<typeof mapStateToProps>>;

const mapStateToProps = (state: RootState) => ({
  project: getProject(state),
  user: getUser(state),
  isServiceManager: isServiceManagerSelector(state),
  isOwnerOrStaff: isOwnerOrStaff(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const ProjectOrderItemsList = enhance(
  TableComponent,
) as React.ComponentType<any>;
