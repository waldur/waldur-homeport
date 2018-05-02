import * as React from 'react';
import { compose } from 'redux';

import { Table, connectTable, createFakeFetcher } from '@waldur/table-react/index';

const ImageNameField = ({ row }) => (
  <span>{row.image_name}</span>
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
        title: translate('Image name'),
        render: ImageNameField,
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
    verboseName={translate('vmImages')}/>
  );
};

const TableOptions = {
  table: 'vmImages',
  fetchData: createFakeFetcher('vm-images'),
};

const enhance = compose(
  connectTable(TableOptions),
);

export const VMImages = enhance(TableComponent);
