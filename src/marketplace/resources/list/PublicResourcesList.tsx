import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { PublicResourcesListActions } from '@waldur/marketplace/resources/list/PublicResourcesListActions';
import { ResourceOpenDetail } from '@waldur/marketplace/resources/list/ResourceOpenDetail';
import { Category, Offering } from '@waldur/marketplace/types';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import {
  getCustomer,
  getUser,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { TABLE_PUBLIC_RESOURCE } from './constants';
import { PublicResourceLink } from './PublicResourceLink';
import { PublicResourcesListPlaceholder } from './PublicResourcesListPlaceholder';
import { ResourceStateField } from './ResourceStateField';

interface ResourceFilter {
  state?: any;
  organization?: Customer;
  category?: Category;
  offering?: Offering;
}

type StateProps = Readonly<ReturnType<typeof mapStateToProps>>;

export const TableComponent: FunctionComponent<any> = (props) => {
  React.useEffect(() => {
    props.resetPagination();
  }, [props.filter]);
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <PublicResourceLink row={row} customer={props.customer} />
      ),
      orderField: 'name',
    },
    {
      title: translate('Offering type'),
      render: ({ row }) => <>{row.offering_name}</>,
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => <>{row.customer_name}</>,
    },
    {
      title: translate('Project'),
      render: ({ row }) => <>{row.project_name}</>,
    },
    {
      title: translate('Category'),
      render: ({ row }) => <>{row.category_title}</>,
    },
    {
      title: translate('Plan'),
      render: ({ row }) => <>{row.plan_name || 'N/A'}</>,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('State'),
      render: ResourceStateField,
    },
    {
      title: translate('Actions'),
      render: PublicResourcesListActions,
    },
  ];

  return (
    <Table
      {...props}
      placeholderComponent={<PublicResourcesListPlaceholder />}
      columns={columns}
      verboseName={translate('Resources')}
      enableExport={true}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
      expandableRow={ResourceOpenDetail}
    />
  );
};

const mapPropsToFilter = (props: StateProps) => {
  const filter: Record<string, string | boolean> = {};

  // Public resources should only contain resources from billable offerings.
  filter.billable = true;

  if (props.customer) {
    filter.provider_uuid = props.customer.uuid;
  }
  if (props.filter) {
    if (props.filter.offering) {
      filter.offering_uuid = props.filter.offering.uuid;
    }
    if (props.filter.state) {
      filter.state = props.filter.state.value;
    }
    if (props.filter.organization) {
      filter.customer_uuid = props.filter.organization.uuid;
    }
    if (props.filter.category) {
      filter.category_uuid = props.filter.category.uuid;
    }
  }
  if (props.isServiceManager) {
    filter.service_manager_uuid = props.user.uuid;
  }
  return filter;
};

const exportRow = (row) => [
  row.name,
  row.uuid,
  row.offering_name,
  row.customer_name,
  row.category_title,
  row.plan_name,
  row.state,
];

const exportFields = [
  'Name',
  'Resource UUID',
  'Offering type',
  'Client organization',
  'Category',
  'Plan',
  'State',
];

export const TableOptions = {
  table: TABLE_PUBLIC_RESOURCE,
  fetchData: createFetcher('marketplace-resources'),
  mapPropsToFilter,
  exportRow,
  exportFields,
  queryField: 'query',
};

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  filter: getFormValues('PublicResourcesFilter')(state) as ResourceFilter,
  user: getUser(state),
  isServiceManager: isServiceManagerSelector(state),
});

const enhance = compose(
  connect<StateProps>(mapStateToProps),
  connectTable(TableOptions),
);

export const PublicResourcesList = enhance(TableComponent);
