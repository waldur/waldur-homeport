import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useFormState } from 'react-final-form';
import {
  Resource,
  marketplaceResourcesEstimateRenewal,
} from 'waldur-js-client';

import { FAST_STALE_TIME } from '@/core/constants';
import { getFormLimitSerializer } from '@/marketplace/common/registry';

import { getMarketplaceResourceUuid } from '../actions/utils';

import { RenewAllocationFormData } from './types';

/**
 * The backend's quote for renewing `resource` with the limits chosen in the
 * renew form: its priced lines and the dates it writes. Every step reads the
 * same query, so the end date shown is the one the renewal sets — later than
 * the current end date plus the extension when a lowered limit stretches the
 * paid-up period.
 */
export const useRenewalEstimate = (
  resource: Resource,
  extensionMonths: number,
) => {
  const { values } = useFormState<RenewAllocationFormData>({
    subscription: { values: true },
  });

  const resourceUuid = getMarketplaceResourceUuid(resource);

  const serializedLimits = useMemo(() => {
    const formLimits = values[resourceUuid]?.limits || {};
    const limitSerializer = getFormLimitSerializer(
      resource.offering_type || '',
    );
    return limitSerializer(formLimits);
  }, [values, resourceUuid, resource.offering_type]);

  return useQuery({
    queryKey: [
      'RenewalEstimate',
      resource.uuid,
      extensionMonths,
      JSON.stringify(serializedLimits),
    ],
    queryFn: () =>
      marketplaceResourcesEstimateRenewal({
        path: { uuid: resourceUuid },
        body: {
          extension_months: extensionMonths,
          limits: serializedLimits,
        },
      }).then((res) => res.data),
    enabled: extensionMonths >= 1 && Boolean(resourceUuid),
    staleTime: FAST_STALE_TIME,
  });
};
