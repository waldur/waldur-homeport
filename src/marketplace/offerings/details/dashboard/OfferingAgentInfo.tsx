import { FC, useCallback } from 'react';
import { AgentIdentity } from 'waldur-js-client';

import { formatDateTime, formatUptime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import FormTable from '@waldur/form/FormTable';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

const AgentPackagesDialog = lazyComponent(() =>
  import('./AgentPackagesDialog').then((module) => ({
    default: module.AgentPackagesDialog,
  })),
);

interface OwnProps {
  agentIdentities?: AgentIdentity[];
  agentIdentity?: AgentIdentity;
  setAgentIdentity?: (value: AgentIdentity) => void;
  empty?: boolean;
}

export const OfferingAgentInfo: FC<OwnProps> = ({
  agentIdentities,
  agentIdentity,
  setAgentIdentity,
  empty,
}) => {
  const { openDialog } = useModal();
  const openPackagesDialog = useCallback(
    () =>
      openDialog(AgentPackagesDialog, {
        resolve: { agentIdentity },
        size: 'lg',
      }),
    [openDialog, agentIdentity],
  );

  return (
    <FormTable.Card
      title={translate('Agent info')}
      className="card-bordered mb-5"
      headerClassName="min-h-60px gap-3"
      actions={
        <Select
          options={agentIdentities}
          value={agentIdentity}
          getOptionValue={(opt) => opt.uuid}
          getOptionLabel={(opt) => opt.name}
          onChange={setAgentIdentity}
          className="flex-grow-1 w-175px mw-sm-350px"
        />
      }
    >
      <FormTable detailsMode className="gy-5">
        {!agentIdentity || empty ? (
          <tr>
            <td colSpan={3} className="text-muted text-center">
              {translate('Agent information not available.')}
            </td>
          </tr>
        ) : (
          <>
            <FormTable.Item
              label={translate('Name')}
              colon
              value={agentIdentity.name}
            />
            <FormTable.Item
              label={translate('Version')}
              colon
              value={agentIdentity.version || 'N/A'}
            />
            <FormTable.Item
              label={translate('Uptime')}
              colon
              value={formatUptime(agentIdentity.last_restarted)}
            />
            <FormTable.Item
              label={translate('Last restart')}
              colon
              value={formatDateTime(agentIdentity.last_restarted)}
            />
            <FormTable.Item
              label={translate('Packages')}
              colon
              value={
                (agentIdentity.dependencies as any[])?.length ? (
                  <CompactActionButton
                    variant="text-primary"
                    className="ms-n2"
                    action={openPackagesDialog}
                    title={translate('Details')}
                  />
                ) : (
                  'N/A'
                )
              }
            />
          </>
        )}
      </FormTable>
    </FormTable.Card>
  );
};
