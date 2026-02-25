import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { OpenstackImagesListData } from 'waldur-js-client';

import {
  TenantImagesFilter,
  selectTenantImagesFilter,
} from '@waldur/table/generated/TenantImagesFilter';

import { TenantImagesList } from './TenantImagesList';

export const TenantImagesTable: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filterValues = useSelector(selectTenantImagesFilter);
  const filter = useMemo(
    (): OpenstackImagesListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
      ...filterValues,
    }),
    [resourceScope?.uuid, filterValues],
  );
  return <TenantImagesList filter={filter} filters={<TenantImagesFilter />} />;
};
