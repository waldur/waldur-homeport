import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { useUser } from '@/workspace/hooks';

import { getMarketplaceResourceUuid } from '../actions/utils';

import { RequestLimitsChangeDialog } from './RequestLimitsChangeDialog';
import { RequestLimitsChangePendingDialog } from './RequestLimitsChangePendingDialog';
import { ownPendingLimitChangeRequestsQuery } from './utils';

interface Props {
  resolve: {
    resource: { marketplace_resource_uuid: string };
    refetch?: () => void;
  };
}

export const RequestLimitsChangeFlowDialog: FC<Props> = ({
  resolve: { resource, refetch },
}) => {
  const user = useUser();
  const resourceUuid = getMarketplaceResourceUuid(resource);

  const { data: pendingRequests, isLoading } = useQuery({
    ...ownPendingLimitChangeRequestsQuery(resourceUuid, user?.uuid),
    enabled: Boolean(resourceUuid && user?.uuid),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const pendingRequest = pendingRequests?.[0];

  if (pendingRequest) {
    return (
      <RequestLimitsChangePendingDialog
        request={pendingRequest}
        refetch={refetch}
      />
    );
  }

  return <RequestLimitsChangeDialog resolve={{ resource, refetch }} />;
};
