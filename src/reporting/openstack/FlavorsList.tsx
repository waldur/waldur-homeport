import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { Table } from '@waldur/table/index';
import { useTable } from '@waldur/table/utils';

import { formatFilter } from './utils';

const FlavorNameField = ({ row }) => <>{row.name}</>;
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

export const FlavorsList: FunctionComponent<{}> = () => {
  const filter = useSelector(mapStateToFilter);
  const tableProps = useTable({
    table: 'flavorsList',
    fetchData: createFetcher('openstack-flavors/usage_stats'),
    filter,
  });
  return (
    <Table
      {...tableProps}
      columns={[
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
      verboseName={translate('Flavors')}
    />
  );
};
