import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { createFetcher } from '@waldur/table-react/api';
import { Table, connectTable } from '@waldur/table-react/index';

import { formatFilter } from './utils';

const FlavorNameField = ({ row }) => <span>{row.name}</span>;
const NumOfRunningInstancesField = ({ row }) => <span>{row.running_instances_count}</span>;
const NumOfCreatedInstancesField = ({ row }) => <span>{row.created_instances_count}</span>;

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table {...props} columns={[
      {
        title: translate('Flavor name'),
        render: FlavorNameField,
      },
      {
        title: translate('Number of running instances'),
        render: NumOfRunningInstancesField,
      },
      {
        title: translate('Number of created instances'),
        render: NumOfCreatedInstancesField,
      },
    ]}
    verboseName={translate('Flavors List')}/>
  );
};

const TableOptions = {
  table: 'flavorsList',
  fetchData: createFetcher('openstacktenant-flavors/usage_stats'),
  mapPropsToFilter: props => formatFilter(props.vmOverviewFilter),
};

const mapStateToProps = state => ({
  vmOverviewFilter: getFormValues('vmOverviewFilter')(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
);

export const FlavorsList = enhance(TableComponent);
