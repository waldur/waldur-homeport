import { FC } from 'react';
import { AgentIdentity } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

export const AgentPackagesDialog: FC<{
  resolve: { agentIdentity: AgentIdentity };
}> = ({ resolve: { agentIdentity } }) => {
  const tableProps = useTable({
    table: 'AgentServiceProcesses',
    fetchData: () => Promise.resolve({ rows: agentIdentity.dependencies }),
  });

  return (
    <ModalDialog title={translate('Packages')} closeButton>
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
