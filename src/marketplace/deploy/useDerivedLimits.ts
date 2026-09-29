import { useMemo } from 'react';
import { Offering } from 'waldur-js-client';

import { getComponentsByType } from '../common/derivedLimits';
import { useSyncDerivedLimits } from '../common/useSyncDerivedLimits';

import { useOrderFormData } from './selectors';

/**
 * Keeps the limits of derived components (`component_formula` and
 * `component_sum` options) in step with the order form, so the plan table
 * shows the quantities and prices them before submitting.
 *
 * A derived component that cannot be calculated is cleared rather than left
 * at a default, because the server would not set it either.
 */
export const useDerivedLimits = (offering?: Offering) => {
  const { attributes, limits } = useOrderFormData();

  const components = useMemo(
    () => getComponentsByType(offering?.components),
    [offering],
  );

  useSyncDerivedLimits({
    options: offering?.options?.options,
    attributes,
    limits,
    components,
  });
};
