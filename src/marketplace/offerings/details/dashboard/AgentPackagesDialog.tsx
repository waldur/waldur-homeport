import { FC } from 'react';
import { AgentIdentity } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

interface AgentPackage {
  package: string;
  version: string;
}

export const AgentPackagesDialog: FC<{
  resolve: { agentIdentity: AgentIdentity };
}> = ({ resolve: { agentIdentity } }) => {
  const tableProps = useTable({
    table: 'AgentPackages',
    fetchData: createClientPaginatedFetcher(
      (agentIdentity.dependencies || []) as AgentPackage[],
    ),
  });

  return (
    <ModalDialog title={translate('Packages')}>
      <Table
        {...tableProps}
        columns={[
          {
            title: translate('Name'),
            render: ({ row }) => <>{row.package}</>,
          },
          {
            title: translate('Version'),
            render: ({ row }) => <>{row.version}</>,
          },
        ]}
        fullWidth
        equalColWidth
        verboseName={translate('Packages')}
        hasActionBar={false}
        hoverShadow={false}
        minHeight="auto"
      />
    </ModalDialog>
  );
};
