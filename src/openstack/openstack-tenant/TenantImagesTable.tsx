import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { OpenstackImagesListData } from 'waldur-js-client';

import {
  OpenstackImagesFilter,
  selectOpenstackImagesFilter,
} from '@/table/generated/OpenstackImagesFilter';

import { TenantImagesList } from './TenantImagesList';

export const TenantImagesTable: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filterValues = useSelector(selectOpenstackImagesFilter);
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
