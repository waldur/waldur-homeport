import { FC, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { AgentIdentity, AgentServiceState } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';

const ServiceProcessesDetailsDialog = lazyComponent(() =>
  import('./ServiceProcessesDetailsDialog').then((module) => ({
    default: module.ServiceProcessesDetailsDialog,
  })),
);

interface OwnProps {
  agentIdentity: AgentIdentity;
}

const statusTips: Partial<Record<AgentServiceState, string>> = {
  Idle: translate("The service wasn't active for the last 10 minutes"),
  Active: translate('The service was active for the last 10 minutes'),
};

const StateField = ({ row }: { row: AgentIdentity['services'][1] }) => (
  <Tip id={'tip-' + row.uuid} label={statusTips[row.state]}>
    <Badge
      variant={
        row.state === 'Active'
          ? 'success'
          : row.state === 'Error'
            ? 'danger'
            : 'warning'
      }
      pill
      outline
    >
      {row.state}
    </Badge>
  </Tip>
);

export const OfferingServices: FC<OwnProps> = ({ agentIdentity }) => {
  const services = agentIdentity.services;
  const { openDialog } = useModal();

  const openProcessesDialog = useCallback(
    (service) =>
      openDialog(ServiceProcessesDetailsDialog, {
        resolve: { agentService: service },
        size: 'lg',
      }),
    [],
  );

  return (
    <FormTable.Card
      title={translate('Services')}
      className="card-bordered mb-5"
      headerClassName="min-h-60px"
    >
      <FormTable detailsMode className="gy-5">
        {!services?.length ? (
          <tr>
            <td colSpan={3} className="text-muted text-center">
              {translate('There are no services yet.')}
            </td>
          </tr>
        ) : (
          services.map((service) => (
            <FormTable.Item
              key={service.uuid}
              label={service.name}
              colon
              value={<StateField row={service} />}
              actions={
                <Button
                  variant="text-primary"
                  size="sm"
                  className="text-nowrap"
                  onClick={() => openProcessesDialog(service)}
                >
                  {translate('Show processes')}
                </Button>
              }
            />
          ))
        )}
      </FormTable>
    </FormTable.Card>
  );
};
