import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { Table, connectTable } from '@waldur/table-react/index';

const ImageNameField = ({ row }) => <span>{row.image_name}</span>;
const NumOfRunningInstancesField = ({ row }) => <span>{row.running_instances_count}</span>;
const NumOfCreatedInstancesField = ({ row }) => <span>{row.created_instances_count}</span>;

export const createFakeFetcher = () => {
  const images = [
    {
      uuid: 'dawk25lhd',
      image_name: 'Image name 1',
      running_instances_count: 44,
      created_instances_count: 23,
    },
    {
      uuid: '7awk25lhl',
      image_name: 'Image name 2',
      running_instances_count: 40,
      created_instances_count: 53,
    },
  ];

  return () => {
    return {
      rows: images,
      resultCount: 2,
    };
  };
};

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
    verboseName={translate('Images List')}/>
  );
};

const TableOptions = {
  table: 'imagesList',
  fetchData: createFakeFetcher(),
  mapPropsToFilter: props => props.vmOverviewFilter,
};

const mapStateToProps = state => ({
  vmOverviewFilter: getFormValues('vmOverviewFilter')(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
);

export const ImagesList = enhance(TableComponent);
