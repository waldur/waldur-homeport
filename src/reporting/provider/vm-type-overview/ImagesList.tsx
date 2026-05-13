import { FunctionComponent, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import {
  OpenStackImage,
  openstackImagesUsageStatsRetrieve,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { formatFilter } from './utils';

const ImageNameField = ({ row }) => <>{row.name}</>;
const NumOfRunningInstancesField = ({ row }) => (
  <>{row.running_instances_count}</>
);

const NumOfCreatedInstancesField = ({ row }) => (
  <>{row.created_instances_count}</>
);

export const ImagesList: FunctionComponent<{}> = () => {
  const { values } = useFormState({ subscription: { values: true } });
  const filter = useMemo(() => formatFilter(values), [values]);

  const props = useTable({
    table: 'imagesList',
    fetchData: createFetcher(openstackImagesUsageStatsRetrieve),
    filter,
  });

  return (
    <Table<OpenStackImage>
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
