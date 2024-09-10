import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { Table } from '@waldur/table/index';
import { useTable } from '@waldur/table/utils';

import { formatFilter } from './utils';

const ImageNameField = ({ row }) => <>{row.name}</>;
const NumOfRunningInstancesField = ({ row }) => (
  <>{row.running_instances_count}</>
);
const NumOfCreatedInstancesField = ({ row }) => (
  <>{row.created_instances_count}</>
);

const mapStateToFilter = createSelector(
  getFormValues('vmOverviewFilter'),
  formatFilter,
);

export const ImagesList: FunctionComponent<{}> = () => {
  const filter = useSelector(mapStateToFilter);

  const props = useTable({
    table: 'imagesList',
    fetchData: createFetcher('openstack-images/usage_stats'),
    filter,
  });

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
