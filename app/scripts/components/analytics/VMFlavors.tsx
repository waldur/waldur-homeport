import * as React from 'react';
import { compose } from 'redux';

import { Table, connectTable, createFakeFetcher } from '@waldur/table-react/index';

const FlavorNameField = ({ row }) => (
  <span>{row.flavor_name}</span>
);

const NumOfRunningInstancesField = ({ row }) => (
  <span>{row.running_instances_count}</span>
);

const NumOfCreatedInstancesField = ({ row }) => (
  <span>{row.created_instances_count}</span>
);

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
    hasQuery={false}
    verboseName={translate('vmFlavors')}/>
  );
};

const TableOptions = {
  table: 'vmFlavors',
  fetchData: createFakeFetcher('vm-flavors'),
};

const enhance = compose(
  connectTable(TableOptions),
);

export const VMFlavors = enhance(TableComponent);
