import { PosixIdPool } from 'waldur-js-client';

import { translate } from '@/i18n';

// Mirrors PosixIdPool.MIN_ID / MAX_ID in the backend: values below 1000 belong
// to system accounts on the hosts, and 2^32 - 1 is reserved as "no id".
export const POSIX_ID_MIN = 1000;
export const POSIX_ID_MAX = 4294967294;

export type NamespaceKey = 'uid' | 'gid';
export const NAMESPACES: NamespaceKey[] = ['uid', 'gid'];

export interface PoolFormValues {
  // Each range is optional but all-or-nothing; at least one must be defined.
  min_uid?: number | null;
  max_uid?: number | null;
  min_gid?: number | null;
  max_gid?: number | null;
}

/** A numeric pool field by name, for code that loops over the namespaces. */
export const poolValue = (
  pool: PosixIdPool | PoolFormValues,
  key: string,
): number | null | undefined => (pool as Record<string, any>)[key];

export const scopeLabel = (pool: PosixIdPool) =>
  pool.scope === 'offering'
    ? translate('offering pool')
    : translate('service provider pool');

/**
 * Form validation mirroring the backend's checks, so a range that would be
 * refused is flagged while typing: both ends or neither, at least one range,
 * the global bounds, and no overlap with the provider's other pools within the
 * same namespace. Whether a shrunk range still holds every allocated value is
 * left to the backend, which knows the allocations.
 */
export const buildPoolValidator =
  (siblings: PosixIdPool[]) => (values: PoolFormValues) => {
    const errors: Record<string, string> = {};
    const missing = translate('Set both the minimum and maximum, or neither.');
    const outOfBounds = translate('Use a value from {min} to {max}.', {
      min: POSIX_ID_MIN,
      max: POSIX_ID_MAX,
    });
    let complete = 0;
    for (const ns of NAMESPACES) {
      const min = poolValue(values, `min_${ns}`);
      const max = poolValue(values, `max_${ns}`);
      if (min == null && max == null) {
        continue;
      }
      if (min == null) {
        errors[`min_${ns}`] = missing;
        continue;
      }
      if (max == null) {
        errors[`max_${ns}`] = missing;
        continue;
      }
      complete += 1;
      if (min < POSIX_ID_MIN || min > POSIX_ID_MAX) {
        errors[`min_${ns}`] = outOfBounds;
      }
      if (max < POSIX_ID_MIN || max > POSIX_ID_MAX) {
        errors[`max_${ns}`] = outOfBounds;
      }
      if (errors[`min_${ns}`] || errors[`max_${ns}`]) {
        continue;
      }
      if (min > max) {
        errors[`max_${ns}`] = translate(
          'The maximum must not be below the minimum.',
        );
        continue;
      }
      const clash = siblings.find(
        (other) =>
          poolValue(other, `min_${ns}`) != null &&
          (poolValue(other, `min_${ns}`) as number) <= max &&
          (poolValue(other, `max_${ns}`) as number) >= min,
      );
      if (clash) {
        errors[`min_${ns}`] = translate(
          'Overlaps {min}–{max} of another {scope}.',
          {
            min: poolValue(clash, `min_${ns}`),
            max: poolValue(clash, `max_${ns}`),
            scope: scopeLabel(clash),
          },
        );
      }
    }
    if (!complete && !Object.keys(errors).length) {
      errors.min_uid = translate(
        'Define at least one of the UID or GID ranges.',
      );
    }
    return errors;
  };
