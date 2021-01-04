import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { RootState } from '@waldur/store/reducers';
import { createFetcher } from '@waldur/table/api';
import { Table, connectTable } from '@waldur/table/index';

import { formatFilter } from './utils';

const ImageNameField = ({ row }) => <>{row.name}</>;
const NumOfRunningInstancesField = ({ row }) => (
  <>{row.running_instances_count}</>
);
const NumOfCreatedInstancesField = ({ row }) => (
  <>{row.created_instances_count}</>
);

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
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
      verboseName={translate('OpenStack Images')}
    />
  );
};

const TableOptions = {
  table: 'imagesList',
  fetchData: createFetcher('openstacktenant-images/usage_stats'),
  mapPropsToFilter: (props) => {
    return formatFilter(props.vmOverviewFilter);
  },
};

const mapStateToProps = (state: RootState) => ({
  vmOverviewFilter: getFormValues('vmOverviewFilter')(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const ImagesList = enhance(TableComponent);
