import { translate } from '@/i18n';
import { Limits } from '@/marketplace/common/types';

import { FetchedData } from '../change-limits/utils';

import { ReallocateFormData } from './types';

export function calculateFreedCapacity(
  currentLimits: Limits,
  newLimits: Limits,
): Limits {
  const freed: Limits = {};
  Object.keys(currentLimits).forEach((key) => {
    const current = Number(currentLimits[key] || 0);
    const newLimit = Number(newLimits[key] || 0);
    const freedAmount = current - newLimit;
    if (freedAmount > 0) {
      freed[key] = freedAmount;
    }
  });
  return freed;
}

export const getValidationState = (
  stepKey: string,
  values: ReallocateFormData,
  fetchedData: FetchedData,
  invalid: boolean,
) => {
  const limits = values.limits;
  const targets = values.targets;

  const freedCapacity =
    fetchedData && limits
      ? calculateFreedCapacity(fetchedData.limits, limits)
      : {};

  let canProceed = !invalid;
  let nextButtonTooltip: string;

  if (stepKey === 'change-limits' && fetchedData) {
    const currentLimits = fetchedData.limits;

    if (limits && currentLimits) {
      const hasFreedCapacity = Object.values(freedCapacity).some(
        (amount) => amount > 0,
      );
      canProceed = hasFreedCapacity;
    } else {
      canProceed = false;
    }
  } else if (stepKey === 'reallocate' && fetchedData) {
    const currentLimits = fetchedData.limits;

    if (limits && currentLimits) {
      const components =
        fetchedData.offering?.components?.filter(
          (c) => c.billing_type === 'limit',
        ) || [];

      const allAllocated = components.every((component) => {
        const freed = freedCapacity[component.type] || 0;
        if (freed === 0) return true;

        // Sum the allocated numbers for the component across multile resources
        const totalAllocated = (targets || []).reduce((sum, target) => {
          return sum + (target.allocated_limits[component.type] || 0);
        }, 0);

        return totalAllocated === freed;
      });

      canProceed = allAllocated && (targets?.length || 0) > 0;
      if (!canProceed) {
        nextButtonTooltip = translate('Allocate all free capacity to continue');
      }
    } else {
      canProceed = false;
    }
  }

  return { canProceed, nextButtonTooltip, freedCapacity };
};
