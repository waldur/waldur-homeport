import { FunctionComponent, useMemo } from 'react';
import { OpenstackVolumeTypesListData } from 'waldur-js-client';

import { TenantVolumeTypesList } from '@/openstack/openstack-volume/TenantVolumeTypesList';

export const TenantVolumeTypesTable: FunctionComponent<{ offering }> = ({
  offering,
}) => {
  const filter = useMemo(
    (): OpenstackVolumeTypesListData['query'] => ({
      offering_uuid: offering.uuid,
    }),
    [offering],
  );
  return <TenantVolumeTypesList filter={filter} />;
};
