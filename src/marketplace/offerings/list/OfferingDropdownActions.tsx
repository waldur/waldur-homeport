import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { getServiceProviderByCustomer } from '@/marketplace/common/api';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser, useCustomer } from '@/workspace/hooks';

import { ConnectRemoteOfferingsAction } from './ConnectRemoteOfferingsAction';
import { SingleOfferingImportAction } from './SingleOfferingImportAction';
import { SiteAgentConfigAction } from './SiteAgentConfigAction';
import { UpdateArticleCodesAction } from './UpdateArticleCodesAction';

interface OfferingDropdownActionsProps {
  refetch(): void;
}

export const OfferingDropdownActions: FC<OfferingDropdownActionsProps> = ({
  refetch,
}) => {
  const customer = useCustomer();
  const user = useUser();
  const canCreateOffering = hasPermission(user, {
    permission: PermissionEnum.CREATE_OFFERING,
    customerId: customer?.uuid,
  });
  const showOfferingListActions =
    customer && customer.is_service_provider && canCreateOffering;

  // Fetch ServiceProvider by customer UUID to get the actual ServiceProvider UUID
  const { data: serviceProvider } = useQuery({
    queryKey: ['ServiceProvider', customer?.uuid],
    queryFn: () =>
      customer?.uuid
        ? getServiceProviderByCustomer({ customer_uuid: customer.uuid })
        : null,
    enabled: !!customer?.uuid && !!customer?.is_service_provider,
  });

  return (
    <>
      {showOfferingListActions && (
        <>
          <ConnectRemoteOfferingsAction
            key="connect-remote-offerings"
            refetch={refetch}
          />
          <SingleOfferingImportAction key="import-offering" refetch={refetch} />
          <SiteAgentConfigAction
            key="generate-site-agent-config"
            serviceProvider={serviceProvider}
          />
        </>
      )}
      {user?.is_staff && (
        <UpdateArticleCodesAction
          key="update-article-codes"
          refetch={refetch}
        />
      )}
    </>
  );
};
