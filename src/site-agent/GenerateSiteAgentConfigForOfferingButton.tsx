import { Gear } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getServiceProviderByCustomer } from '@waldur/marketplace/common/api';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const SiteAgentConfigDialog = lazyComponent(() =>
  import('./SiteAgentConfigDialog').then((m) => ({
    default: m.SiteAgentConfigDialog,
  })),
);

interface GenerateSiteAgentConfigForOfferingButtonProps {
  offering: ProviderOfferingDetails;
}

export const GenerateSiteAgentConfigForOfferingButton: FC<
  GenerateSiteAgentConfigForOfferingButtonProps
> = ({ offering }) => {
  const dispatch = useDispatch();

  // Fetch the service provider for this offering's customer
  const { data: serviceProvider, isLoading } = useQuery({
    queryKey: ['service-provider', offering.customer_uuid],
    queryFn: () =>
      getServiceProviderByCustomer({ customer_uuid: offering.customer_uuid }),
    enabled: !!offering.customer_uuid,
  });

  const handleClick = () => {
    if (!serviceProvider) return;

    dispatch(
      openModalDialog(SiteAgentConfigDialog, {
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
      }),
    );
  };

  return (
    <ActionButton
      title={translate('Generate Site Agent Config')}
      action={handleClick}
      iconNode={<Gear />}
      disabled={isLoading || !serviceProvider}
      pending={isLoading}
    />
  );
};
