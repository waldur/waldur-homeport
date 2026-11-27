import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { getServiceProviderByCustomer } from '@/marketplace/common/api';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';

import { AgentLoadsPanel } from './AgentLoadsPanel';

const SiteAgentConfigDialog = lazyComponent(() =>
  import('@/site-agent/SiteAgentConfigDialog').then((module) => ({
    default: module.SiteAgentConfigDialog,
  })),
);

/** The configuration file comes from the service provider's generator,
 * with this offering picked. */
const GenerateFileButton: FC<{ offering: ProviderOfferingDetails }> = ({
  offering,
}) => {
  const { openDialog } = useModal();
  const { data: serviceProvider, isLoading } = useQuery({
    queryKey: ['service-provider', offering.customer_uuid],
    queryFn: () =>
      getServiceProviderByCustomer({ customer_uuid: offering.customer_uuid }),
    enabled: !!offering.customer_uuid,
  });
  return (
    <BaseButton
      variant="secondary"
      label={translate('Generate configuration file')}
      pending={isLoading}
      disabled={!serviceProvider}
      disabledReason={
        isLoading
          ? undefined
          : translate('Service provider not found for this offering.')
      }
      onClick={() =>
        openDialog(SiteAgentConfigDialog, {
          resolve: {
            provider: {
              uuid: serviceProvider.uuid,
              customer_name: serviceProvider.customer_name,
            },
            fixedOffering: { uuid: offering.uuid, name: offering.name },
          },
          size: 'lg',
        })
      }
      data-testid="agent-setup-generate"
    />
  );
};

export interface AgentLoadsDialogProps {
  resolve: { offering: ProviderOfferingDetails };
}

/**
 * What the site agent loads for the offering: the served configuration and
 * the secrets its configuration file must hold, with the generator of that
 * file.
 */
export const AgentLoadsDialog: FC<AgentLoadsDialogProps> = ({
  resolve: { offering },
}) => (
  <ModalDialog
    title={translate('What the agent loads')}
    subtitle={offering.name}
    footer={<GenerateFileButton offering={offering} />}
  >
    <AgentLoadsPanel offeringUuid={offering.uuid} />
  </ModalDialog>
);
