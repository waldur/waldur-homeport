import { FC, useCallback } from 'react';
import { AgentIdentity } from 'waldur-js-client';

import {
  BaseButton,
  PropertyCard,
  PropertyItem,
  PropertyList,
} from 'waldur-ui';

import { formatUptime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { propVal } from '@/property/propertyFields';

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
    <PropertyCard
      bordered
      title={translate('Agent info')}
      className="mb-4"
      headerClassName="min-h-[60px] gap-2.5"
      actions={
        <Select
          options={agentIdentities}
          value={agentIdentity}
          getOptionValue={(opt) => opt.uuid}
          getOptionLabel={(opt) => opt.name}
          onChange={setAgentIdentity}
          className="grow w-[175px] sm:max-w-[350px]"
        />
      }
    >
      {!agentIdentity || empty ? (
        <p className="m-0 py-4 text-center text-quaternary">
          {translate('Agent information not available.')}
        </p>
      ) : (
        <PropertyList detailsMode>
          <PropertyItem
            label={translate('Name')}
            colon
            value={agentIdentity.name}
          />
          <PropertyItem
            label={translate('Version')}
            colon
            value={agentIdentity.version}
          />
          <PropertyItem
            label={translate('Uptime')}
            colon
            value={formatUptime(agentIdentity.last_restarted)}
          />
          <PropertyItem
            label={translate('Last restart')}
            colon
            value={propVal.date(agentIdentity.last_restarted, {
              precision: 'datetime',
            })}
          />
          <PropertyItem
            label={translate('Packages')}
            colon
            value={
              (agentIdentity.dependencies as any[])?.length ? (
                <BaseButton
                  variant="text-primary"
                  className="-ms-1.5"
                  onClick={openPackagesDialog}
                  label={translate('Details')}
                  size="sm"
                />
              ) : null
            }
          />
        </PropertyList>
      )}
    </PropertyCard>
  );
};
