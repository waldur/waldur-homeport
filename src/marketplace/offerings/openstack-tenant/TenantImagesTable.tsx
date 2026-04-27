import { FunctionComponent, useMemo } from 'react';
import { OpenstackImagesListData } from 'waldur-js-client';

import { TenantImagesList } from '@/openstack/openstack-tenant/TenantImagesList';

export const TenantImagesTable: FunctionComponent<{ offering }> = ({
  offering,
}) => {
  const filter = useMemo(
    (): OpenstackImagesListData['query'] => ({
      offering_uuid: offering.uuid,
    }),
    [offering],
  );
  return <TenantImagesList filter={filter} />;
};
