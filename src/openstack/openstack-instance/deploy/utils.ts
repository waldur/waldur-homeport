import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { FORM_ID } from '@waldur/marketplace/details/constants';
import { Offering } from '@waldur/marketplace/types';
import { loadVolumeTypes } from '@waldur/openstack/api';
import { DYNAMIC_STORAGE_MODE } from '@waldur/openstack/constants';
import { getQuotas } from '@waldur/openstack/openstack-instance/OpenstackInstanceCheckoutSummary';
import {
  formatVolumeTypeChoices,
  getDefaultVolumeType,
} from '@waldur/openstack/openstack-instance/utils';
import { parseQuotas, parseQuotasUsage } from '@waldur/openstack/utils';
import { RootState } from '@waldur/store/reducers';

import { Flavor, OpenStackInstanceFormData } from '../types';

export const formDataSelector = (state: RootState) =>
  (getFormValues(FORM_ID)(state) || {}) as OpenStackInstanceFormData;

export const formAttributesSelector = (state: RootState) => {
  const formData = formDataSelector(state);
  return formData.attributes || {};
};

export const formFlavorSelector = (state: RootState) => {
  const formAttrs = formAttributesSelector(state);
  return formAttrs.flavor as Flavor;
};

export const formVolumesSelector = (state: RootState) => {
  const formAttrs = formAttributesSelector(state);
  return {
    system_volume_size: formAttrs.system_volume_size,
    data_volume_size: formAttrs.data_volume_size,
  };
};

export const getOfferingLimit = (
  offering: Offering,
  quotaName: string,
  defaultLimit = Infinity,
) => {
  if (!offering?.quotas?.length) return 0;
  const quota = offering.quotas.find((qouta) => qouta.name === quotaName);
  if (!quota) return defaultLimit;
  return quota.limit;
};

export const useQuotasData = (offering: Offering) => {
  const formData = useSelector(formAttributesSelector);
  const usages = useMemo(
    () => parseQuotasUsage(offering.quotas || []),
    [offering],
  );
  const limits = useMemo(() => parseQuotas(offering.quotas || []), [offering]);
  const storage_mode = offering.plugin_options.storage_mode;
  return useMemo(() => {
    const quotas = getQuotas({ formData, usages, limits, storage_mode });
    return {
      vcpuQuota: quotas.find((q) => q.name === 'vcpu'),
      ramQuota: quotas.find((q) => q.name === 'ram'),
      storageQuota: quotas.find((q) => q.name === 'storage'),
      volumeTypeQuotas: quotas.filter(
        (q) => !['vcpu', 'ram', 'storage'].includes(q.name),
      ),
    };
  }, [formData, usages, limits, storage_mode]);
};

export const useVolumeDataLoader = (offering: Offering) => {
  return useQuery(
    ['volumeTypes', offering.uuid],
    async () => {
      let volumeTypeChoices = [];
      let defaultVolumeType;
      const storage_mode = offering.plugin_options.storage_mode;
      if (storage_mode === DYNAMIC_STORAGE_MODE) {
        const volumeTypes = offering.scope_uuid
          ? await loadVolumeTypes(offering.scope_uuid)
          : [];
        volumeTypeChoices = formatVolumeTypeChoices(volumeTypes);
        defaultVolumeType = getDefaultVolumeType(volumeTypeChoices);
      }
      return {
        volumeTypeChoices,
        defaultVolumeType,
      };
    },
    { staleTime: 3 * 60 * 1000 },
  );
};
