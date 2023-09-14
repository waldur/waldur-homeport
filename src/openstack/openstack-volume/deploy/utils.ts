import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Offering } from '@waldur/marketplace/types';
import { formDataSelector } from '@waldur/marketplace/utils';
import { parseQuotas, parseQuotasUsage } from '@waldur/openstack/utils';
import { RootState } from '@waldur/store/reducers';

import { getQuotas } from '../OpenstackVolumeCheckoutSummary';

export const formAttributesSelector = (state: RootState) => {
  const formData = formDataSelector(state);
  return formData.attributes || {};
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
      storageQuota: quotas.find((q) => q.name === 'storage'),
      volumeTypeQuotas: quotas.filter(
        (q) => !['vcpu', 'ram', 'storage'].includes(q.name),
      ),
    };
  }, [formData, usages, limits]);
};
