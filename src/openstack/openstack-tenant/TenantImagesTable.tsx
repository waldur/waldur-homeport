import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { OpenstackImagesListData } from 'waldur-js-client';

import {
  TenantImagesFilter,
  TENANT_IMAGES_FILTER_FORM_ID,
} from './TenantImagesFilter';
import { TenantImagesList } from './TenantImagesList';

export const TenantImagesTable: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filterValues = useSelector(
    getFormValues(TENANT_IMAGES_FILTER_FORM_ID),
  ) as OpenstackImagesListData['query'];
  const filter = useMemo(
    (): OpenstackImagesListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
      ...(filterValues?.show_duplicate_names
        ? { show_duplicate_names: true }
        : {}),
    }),
    [resourceScope?.uuid, filterValues?.show_duplicate_names],
  );
  return <TenantImagesList filter={filter} filters={<TenantImagesFilter />} />;
};
