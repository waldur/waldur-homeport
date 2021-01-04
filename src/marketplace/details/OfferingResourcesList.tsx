import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import {
  FILTER_OFFERING_RESOURCE,
  TABLE_OFFERING_RESOURCE,
} from '@waldur/marketplace/details/constants';
import { PublicResourceLink } from '@waldur/marketplace/resources/list/PublicResourceLink';
import { PublicResourcesListPlaceholder } from '@waldur/marketplace/resources/list/PublicResourcesListPlaceholder';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';
import { ResourceState } from '@waldur/marketplace/resources/types';
import { ResourceUsageButton } from '@waldur/marketplace/resources/usage/ResourceUsageButton';
import { Offering } from '@waldur/marketplace/types';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';

interface OfferingResourceFilter {
  state?: ResourceState;
}

interface StateProps {
  filter: OfferingResourceFilter;
}

interface OwnProps {
  offering: Offering;
}

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: PublicResourceLink,
      orderField: 'name',
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
      render: ResourceUsageButton,
    },
  ];

  return (
    <Table
      {...props}
      placeholderComponent={<PublicResourcesListPlaceholder />}
      columns={columns}
      verboseName={translate('offering resources')}
      enableExport={true}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
    />
  );
};

const mapPropsToFilter = (props) => {
  const filter: Record<string, string> = {};
  if (props.filter && props.filter.state) {
    filter.state = props.filter.state.value;
  }
  return {
    offering_uuid: props.offering.uuid,
    ...filter,
  };
};

const exportRow = (row) => [
  row.name,
  row.uuid,
  row.customer_name,
  row.plan_name,
  row.state,
];

const exportFields = [
  'Name',
  'Resource UUID',
  'Client organization',
  'Plan',
  'State',
];

export const TableOptions = {
  table: TABLE_OFFERING_RESOURCE,
  fetchData: createFetcher('marketplace-resources'),
  mapPropsToFilter,
  exportRow,
  exportFields,
  queryField: 'query',
};

const mapStateToProps = (state: RootState) => ({
  filter: getFormValues(FILTER_OFFERING_RESOURCE)(state),
});

const enhance = compose(
  connect<StateProps, {}, OwnProps>(mapStateToProps),
  connectTable(TableOptions),
);

export const OfferingResourcesList = enhance(TableComponent);
