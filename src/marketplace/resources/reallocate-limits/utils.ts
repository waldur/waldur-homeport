import { Limits } from '@/marketplace/common/types';

export function calculateFreedCapacity(
  currentLimits: Limits,
  newLimits: Limits,
): Limits {
  const freed: Limits = {};
  Object.keys(currentLimits).forEach((key) => {
    const current = currentLimits[key] || 0;
    const newLimit = newLimits[key] || 0;
    const freedAmount = current - newLimit;
    if (freedAmount > 0) {
      freed[key] = freedAmount;
    }
  });
  return freed;
}
