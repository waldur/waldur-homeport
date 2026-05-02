import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Dropdown } from 'react-bootstrap';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { getServiceProviderByCustomer } from '@/marketplace/common/api';
import { useModal } from '@/modal/actions';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';

import { SITE_AGENT_PLUGIN } from './constants';

const SiteAgentConfigDialog = lazyComponent(() =>
  import('./SiteAgentConfigDialog').then((m) => ({
    default: m.SiteAgentConfigDialog,
  })),
);

const LdapAgentEnvDialog = lazyComponent(() =>
  import('./LdapAgentEnvDialog').then((m) => ({
    default: m.LdapAgentEnvDialog,
  })),
);

interface SlurmOfferingActionsProps {
  offering: ProviderOfferingDetails;
}

export const SlurmOfferingActions: FC<SlurmOfferingActionsProps> = ({
  offering,
}) => {
  const { openDialog } = useModal();

  const { data: serviceProvider, isLoading } = useQuery({
    queryKey: ['service-provider', offering.customer_uuid],
    queryFn: () =>
      getServiceProviderByCustomer({ customer_uuid: offering.customer_uuid }),
    enabled: !!offering.customer_uuid,
  });

  const openSiteAgentConfig = () => {
    if (!serviceProvider) return;
    openDialog(SiteAgentConfigDialog, {
      resolve: {
        provider: {
          uuid: serviceProvider.uuid,
          customer_name: serviceProvider.customer_name,
        },
        fixedOffering: {
          uuid: offering.uuid,
          name: offering.name,
        },
      },
      size: 'lg',
    });
  };

  const openLdapAgentEnv = () => {
    openDialog(LdapAgentEnvDialog, {
      resolve: {
        offering: {
          uuid: offering.uuid,
          name: offering.name,
        },
      },
      size: 'lg',
    });
  };

  const showSiteAgentConfig = offering.type === SITE_AGENT_PLUGIN;
  const showLdapAgentEnv =
    !!offering.plugin_options?.service_provider_can_create_offering_user;

  if (!showSiteAgentConfig && !showLdapAgentEnv) return null;

  return (
    <ActionDropdownButton
      title={translate('Actions')}
      disabled={isLoading}
      align="end"
    >
      {showSiteAgentConfig && (
        <Tip
          id="site-agent-config-item"
          label={
            !serviceProvider
              ? translate('Service provider not found for this offering.')
              : null
          }
        >
          <Dropdown.Item
            onClick={openSiteAgentConfig}
            disabled={!serviceProvider}
          >
            {translate('Generate Site Agent Config')}
          </Dropdown.Item>
        </Tip>
      )}
      {showLdapAgentEnv && (
        <Dropdown.Item onClick={openLdapAgentEnv}>
          {translate('Generate LDAP Agent Env')}
        </Dropdown.Item>
      )}
    </ActionDropdownButton>
  );
};
