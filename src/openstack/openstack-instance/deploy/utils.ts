import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  openstackVolumeTypesList,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { TENANT_TYPE } from '@/openstack/constants';
import {
  formatVolumeTypeChoices,
  getDefaultVolumeType,
  getQuotas,
} from '@/openstack/openstack-instance/utils';
import { parseQuotas, parseQuotasUsage } from '@/openstack/utils';

export const getOfferingLimit = (
  offering: Pick<PublicOfferingDetails, 'quotas'>,
  quotaName: string,
  defaultLimit = Infinity,
) => {
  if (!offering?.quotas?.length) return -1;
  const quota = offering.quotas.find((qouta) => qouta.name === quotaName);
  if (!quota) return defaultLimit;
  return quota.limit;
};

export const useQuotasData = (
  offering: Pick<PublicOfferingDetails, 'quotas'>,
) => {
  const { attributes = {} } = useOrderFormData();
  const usages = useMemo(
    () => parseQuotasUsage(offering.quotas || []),
    [offering],
  );
  const limits = useMemo(() => parseQuotas(offering.quotas || []), [offering]);
  return useMemo(() => {
    const quotas = getQuotas({ attributes, usages, limits });
    return {
      quotas,
      vcpuQuota: quotas.find((q) => q.name === 'vcpu'),
      ramQuota: quotas.find((q) => q.name === 'ram'),
      storageQuota: quotas.find((q) => q.name === 'storage'),
      instancesQuota: quotas.find((q) => q.name === 'instances'),
      fipQuota: quotas.find((q) => q.name === 'floating_ip_count'),
    };
  }, [attributes, usages, limits]);
};

export const useVolumeDataLoader = (
  offering: Pick<PublicOfferingDetails, 'scope_uuid' | 'type' | 'uuid'>,
) => {
  return useQuery({
    queryKey: ['volumeTypes', offering.uuid],

    queryFn: async () => {
      const volumeTypes = offering.scope_uuid
        ? await getAllPages((page) =>
            openstackVolumeTypesList({
              query: {
                page,
                ...(offering.type === TENANT_TYPE
                  ? { settings_uuid: offering.scope_uuid }
                  : { tenant_uuid: offering.scope_uuid }),
              },
            }),
          )
        : [];
      const volumeTypeChoices = formatVolumeTypeChoices(volumeTypes);
      const defaultVolumeType = getDefaultVolumeType(volumeTypeChoices);
      return {
        volumeTypeChoices,
        defaultVolumeType,
      };
    },

    staleTime: UI_STALE_TIME,
  });
};
