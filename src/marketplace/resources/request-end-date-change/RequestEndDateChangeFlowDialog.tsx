import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { marketplaceResourceEndDateChangeRequestsList } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { useUser } from '@/workspace/hooks';

import { RequestEndDateChangeDialog } from './RequestEndDateChangeDialog';
import { RequestEndDateChangePendingDialog } from './RequestEndDateChangePendingDialog';

interface Props {
  resolve: {
    resource: { marketplace_resource_uuid: string };
    refetch?: () => void;
  };
}

export const RequestEndDateChangeFlowDialog: FC<Props> = ({
  resolve: { resource, refetch },
}) => {
  const user = useUser();

  const { data: response, isLoading } = useQuery({
    queryKey: [
      'resource-end-date-change-requests',
      resource.marketplace_resource_uuid,
      user?.uuid,
    ],
    queryFn: () =>
      marketplaceResourceEndDateChangeRequestsList({
        query: {
          resource_uuid: resource.marketplace_resource_uuid,
          state: ['pending'],
          created_by_uuid: user?.uuid,
        },
      }),
    enabled: Boolean(resource.marketplace_resource_uuid && user?.uuid),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const items = Array.isArray(response?.data) ? response.data : [];
  const pendingRequest = items[0];

  if (pendingRequest) {
    return (
      <RequestEndDateChangePendingDialog
        request={pendingRequest}
        refetch={refetch}
      />
    );
  }

  return <RequestEndDateChangeDialog resolve={{ resource, refetch }} />;
};
