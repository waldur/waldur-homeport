import { FunctionComponent, useMemo } from 'react';
import { OpenstackImagesListData } from 'waldur-js-client';

import {
  OpenstackImagesFilter,
  selectOpenstackImagesFilter,
} from '@/table/generated/OpenstackImagesFilter';
import { useFilterValues } from '@/table/useFilterValues';

import { TenantImagesList } from './TenantImagesList';

export const TenantImagesTable: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const values = useFilterValues('openstack-images');

  const filterValues = useMemo(
    () => selectOpenstackImagesFilter(values),
    [values],
  );

  const filter = useMemo(
    (): OpenstackImagesListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
      ...filterValues,
    }),
    [resourceScope?.uuid, filterValues],
  );
  return (
    <TenantImagesList filter={filter} filters={<OpenstackImagesFilter />} />
  );
};
