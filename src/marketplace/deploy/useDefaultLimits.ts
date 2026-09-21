import { useEffect } from 'react';
import { useForm } from 'react-final-form';
import { Offering } from 'waldur-js-client';

import { Limits } from '../common/types';
import { getDefaultLimits } from '../offerings/utils';

import { useOrderFormData } from './selectors';

interface DefaultLimitsOptions {
  /** The offering the form is currently ordering. */
  offering?: Offering;
  /** Limits the page was opened with; they win over the offering's defaults. */
  fallbackLimits?: Limits;
  /** Edit mode: the order carries its own limits, so nothing is seeded. */
  skip?: boolean;
}

/**
 * Keeps the offering's default limits in the form.
 *
 * The seeding merges what the form already holds on top of the defaults, so it
 * never overwrites a number the user has typed, nor one a step has written --
 * the vSphere template step sets cpu, ram and disk from the chosen template,
 * and the two race. Which one won used to depend on whether the template query
 * was served from cache: a plain reassignment blanked the fields when the
 * seeding ran second, and a one-shot guard blanked them when it ran first,
 * since React flushes a child's effects before its parent's. Merging is
 * invariant to that ordering.
 *
 * The offering's identity alone is not enough of a trigger. Choosing the
 * project calls `setCurrentProject`, which re-runs `initializeFormValues` in
 * DeployPage and hands <Form> a new `initialValues` object; react-final-form
 * reinitialises and drops everything written by `form.change`, the limits among
 * them, while the offering stays exactly the same object. So the emptiness of
 * `values.limits` is a trigger too: it is true again after a reinitialisation
 * and after FormCloudStep clears the limits to switch the offering, and it does
 * not toggle while the user edits a value.
 */
export const useDefaultLimits = ({
  offering,
  fallbackLimits,
  skip,
}: DefaultLimitsOptions) => {
  const form = useForm();
  const { limits } = useOrderFormData();

  const hasLimits = Boolean(limits && Object.keys(limits).length > 0);

  useEffect(() => {
    if (skip || !offering) return;
    form.change('limits', {
      ...getDefaultLimits(offering),
      ...fallbackLimits,
      ...form.getState().values.limits,
    });
  }, [offering, hasLimits, skip]);
};
