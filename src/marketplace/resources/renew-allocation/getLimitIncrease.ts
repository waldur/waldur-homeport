/**
 * How much a renewal raises a limit, for display. Limits in display units can
 * be fractional, and subtracting floats leaves noise (1.5 - 1.2 is
 * 0.30000000000000004), so the result is rounded to ten decimal places, the
 * precision the backend stores quantities in.
 */
export const getLimitIncrease = (
  currentLimit: number | string,
  newLimit: number | string,
): number => Number((Number(newLimit) - Number(currentLimit)).toFixed(10));
