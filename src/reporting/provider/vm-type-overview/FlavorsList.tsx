import { FunctionComponent, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import { openstackFlavorsUsageStatsRetrieve } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { formatFilter } from './utils';

const FlavorNameField = ({ row }) => <>{row.name}</>;
const NumOfRunningInstancesField = ({ row }) => (
  <>{row.running_instances_count}</>
);

const NumOfCreatedInstancesField = ({ row }) => (
  <>{row.created_instances_count}</>
);

export const FlavorsList: FunctionComponent<{}> = () => {
  const { values } = useFormState({ subscription: { values: true } });
  const filter = useMemo(() => formatFilter(values), [values]);

  const tableProps = useTable({
    table: 'flavorsList',
    fetchData: createFetcher(openstackFlavorsUsageStatsRetrieve),
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
