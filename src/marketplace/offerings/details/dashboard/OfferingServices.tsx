import { FC, useCallback } from 'react';
import { AgentIdentity, AgentServiceState } from 'waldur-js-client';

import {
  BaseButton,
  PropertyCard,
  PropertyItem,
  PropertyList,
  Tooltip,
} from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
  <Tooltip label={statusTips[row.state]}>
    <Badge
      variant={
        row.state === 'Active'
          ? 'success'
          : row.state === 'Error'
            ? 'danger'
            : 'warning'
      }
      shape="pill"
      tone="outline"
    >
      {row.state}
    </Badge>
  </Tooltip>
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
    <PropertyCard
      bordered
      title={translate('Services')}
      className="mb-4"
      headerClassName="min-h-[60px]"
    >
      {!services?.length ? (
        <p className="m-0 py-4 text-center text-quaternary">
          {translate('There are no services yet.')}
        </p>
      ) : (
        <PropertyList detailsMode>
          {services.map((service) => (
            <PropertyItem
              key={service.uuid}
              label={service.name}
              colon
              value={<StateField row={service} />}
              actions={
                <BaseButton
                  variant="text-primary"
                  className="whitespace-nowrap"
                  onClick={() => openProcessesDialog(service)}
                  label={translate('Show processes')}
                  size="sm"
                />
              }
            />
          ))}
        </PropertyList>
      )}
    </PropertyCard>
  );
};
