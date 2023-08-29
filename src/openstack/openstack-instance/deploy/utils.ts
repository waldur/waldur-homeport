import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { Offering } from '@waldur/marketplace/types';
import { loadVolumeTypes } from '@waldur/openstack/api';
import { getQuotas } from '@waldur/openstack/openstack-instance/OpenstackInstanceCheckoutSummary';
import {
  formatVolumeTypeChoices,
  getDefaultVolumeType,
} from '@waldur/openstack/openstack-instance/utils';
import { parseQuotas, parseQuotasUsage } from '@waldur/openstack/utils';
import { RootState } from '@waldur/store/reducers';

import { OpenStackInstanceFormData } from '../types';

export const formDataSelector = (state: RootState) =>
  (getFormValues(FORM_ID)(state) || {}) as OpenStackInstanceFormData;

export const formAttributesSelector = (state: RootState) => {
  const formData = formDataSelector(state);
  return formData.attributes || {};
};

export const formFlavorSelector = (state: RootState) => {
  const formAttrs = formAttributesSelector(state);
  return formAttrs.flavor;
};

export const formVolumesSelector = (state: RootState) => {
  const formAttrs = formAttributesSelector(state);
  return {
    system_volume_size: formAttrs.system_volume_size,
    data_volume_size: formAttrs.data_volume_size,
  };
};

export const getStorageLimit = (offering: Offering) => {
  if (!offering?.quotas?.length) return 0;
  const quota = offering.quotas.find((qouta) => qouta.name === 'storage');
  if (!quota) return 10240 * 1024;
  return quota.limit - quota.usage;
};

export const useQuotasData = (offering: Offering) => {
  const formData = useSelector(formAttributesSelector);
  const usages = useMemo(
    () => parseQuotasUsage(offering.quotas || []),
    [offering],
  );
  const limits = useMemo(() => parseQuotas(offering.quotas || []), [offering]);
  return useMemo(() => {
    const quotas = getQuotas({ formData, usages, limits });
    return {
      vcpuQuota: quotas.find((q) => q.name === 'vcpu'),
      ramQuota: quotas.find((q) => q.name === 'ram'),
      storageQuota: quotas.find((q) => q.name === 'storage'),
      volumeTypeQuotas: quotas.filter(
        (q) => !['vcpu', 'ram', 'storage'].includes(q.name),
      ),
    };
  }, [formData, usages, limits]);
};

export const useVolumeDataLoader = (offering: Offering) => {
  return useQuery(
    ['volumeTypes', offering.uuid],
    async () => {
      let volumeTypeChoices = [];
      let defaultVolumeType;
      if (isFeatureVisible('openstack.volume_types')) {
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
