import { get } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-final-form';

import { computeDerivedLimits } from './derivedLimits';

interface SyncDerivedLimitsOptions {
  /** The offering's order options, `offering.options.options`. */
  options?: Parameters<typeof computeDerivedLimits>[0];
  /** Where the formula inputs are read from. */
  attributes?: Record<string, unknown>;
  /** The limits currently in the form. */
  limits?: Record<string, unknown>;
  /** Limit components by type, for their precision. */
  components: Record<string, { limit_decimal_places?: number | null }>;
  /** Values the server keeps when a derived limit cannot be calculated. */
  fallback?: Record<string, unknown>;
  /** Form path of the limits, `limits` unless nested. */
  name?: string;
}

/**
 * Keeps the derived limits in a form in step with what they are derived from,
 * so the price shown is the price the server will charge; the server
 * recalculates them on submit and keeps its own.
 *
 * Comparing with the current values on every run is what keeps this from
 * looping: once the limits match, the next run writes nothing. It also puts a
 * derived value back after anything else rewrites the limits.
 */
export const useSyncDerivedLimits = ({
  options,
  attributes,
  limits,
  components,
  fallback,
  name = 'limits',
}: SyncDerivedLimitsOptions) => {
  const form = useForm();

  const derived = useMemo(
    () =>
      computeDerivedLimits(options, attributes, limits, components, fallback),
    [options, attributes, limits, components, fallback],
  );

  useEffect(() => {
    const current = get(form.getState().values, name) || {};
    const changes = Object.entries(derived).filter(
      ([type, value]) => current[type] !== value,
    );
    if (changes.length === 0) {
      return;
    }
    form.batch(() => {
      changes.forEach(([type, value]) => form.change(`${name}.${type}`, value));
    });
  }, [form, derived, name]);
};
