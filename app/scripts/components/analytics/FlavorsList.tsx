import * as React from 'react';
import { compose } from 'redux';

import { Table, connectTable } from '@waldur/table-react/index';

const FlavorNameField = ({ row }) => <span>{row.flavor_name}</span>;
const NumOfRunningInstancesField = ({ row }) => <span>{row.running_instances_count}</span>;
const NumOfCreatedInstancesField = ({ row }) => <span>{row.created_instances_count}</span>;

export const createFakeFetcher = () => {
  const flavors = [
    {
      uuid: 'dawk25lhd',
      flavor_name: 'Flavor name 1',
      running_instances_count: 44,
      created_instances_count: 23,
    },
    {
      uuid: '7awk25lhl',
      flavor_name: 'Flavor name 2',
      running_instances_count: 40,
      created_instances_count: 53,
    },
  ];

  return () => {
    return {
      rows: flavors,
      resultCount: 2,
    };
  };
};

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
  fetchData: createFakeFetcher(),
};

const enhance = compose(
  connectTable(TableOptions),
);

export const FlavorsList = enhance(TableComponent);
