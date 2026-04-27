import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  marketplaceSiteAgentServicesRetrieve,
  NestedAgentProcessor,
  NestedAgentService,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

const TableComponent = ({
  processors,
}: {
  processors: NestedAgentProcessor[];
}) => {
  const tableProps = useTable({
    table: 'AgentServiceProcesses',
    fetchData: () => Promise.resolve({ rows: processors }),
  });

  return (
    <Table<NestedAgentProcessor>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Last run'),
          render: ({ row }) => <>{formatDateTime(row.last_run)}</>,
        },
        {
          title: translate('Backend'),
          render: ({ row }) => (
            <Tip id={'tip-' + row.uuid} label={row.backend_type}>
              {row.backend_type}
            </Tip>
          ),
        },
        {
          title: translate('Version'),
          render: ({ row }) => <>{row.backend_version}</>,
        },
      ]}
      fullWidth
      equalColWidth
      verboseName={translate('Processors')}
      hasActionBar={false}
      hoverShadow={false}
      minHeight="auto"
    />
  );
};

export const ServiceProcessesDetailsDialog: FC<{
  resolve: { agentService: NestedAgentService };
}> = ({ resolve: { agentService } }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['agentService', agentService.uuid],
    queryFn: () =>
      marketplaceSiteAgentServicesRetrieve({
        path: { uuid: agentService.uuid },
      }).then((response) => response.data),
    staleTime: UI_STALE_TIME,
  });

  return (
    <ModalDialog title={agentService.name} closeButton>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : !data?.processors?.length ? (
        <p className="text-muted text-center">
          {translate('There are no processes.')}
        </p>
      ) : (
        <TableComponent processors={data.processors} />
      )}
    </ModalDialog>
  );
};
