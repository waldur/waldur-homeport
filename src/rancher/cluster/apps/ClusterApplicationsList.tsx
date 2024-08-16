import { FunctionComponent, useMemo } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { ApplicationDeleteButton } from './ApplicationDeleteButton';
import { ApplicationDetailsButton } from './ApplicationDetailsButton';

const ApplicationActions = ({ row }) => (
  <ButtonGroup>
    <ApplicationDetailsButton application={row} />
    <ApplicationDeleteButton application={row} />
  </ButtonGroup>
);

export const ClusterApplicationsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      cluster_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'rancher-apps',
    fetchData: createFetcher('rancher-apps'),
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
        },
        {
          title: translate('Project'),
          render: ({ row }) => <>{row.project_name}</>,
        },
        {
          title: translate('Catalog'),
          render: ({ row }) => <>{row.catalog_name}</>,
        },
        {
          title: translate('Template'),
          render: ({ row }) => <>{row.template_name}</>,
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDate(row.created)}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
        },
        {
          title: translate('Actions'),
          render: ApplicationActions,
        },
      ]}
      verboseName={translate('applications')}
    />
  );
};
