import { PosixIdPool } from 'waldur-js-client';

import { translate } from '@/i18n';

// Mirrors PosixIdPool.MIN_ID / MAX_ID in the backend: values below 1000 belong
// to system accounts on the hosts, and 2^32 - 1 is reserved as "no id".
export const POSIX_ID_MIN = 1000;
export const POSIX_ID_MAX = 4294967294;

export type NamespaceKey = 'uid' | 'gid';
const NAMESPACES: NamespaceKey[] = ['uid', 'gid'];

// A pool may reserve a second GID range for provider project groups. Its values
// are GIDs like any other, so it is checked against GID ranges.
export type RangeKey = NamespaceKey | 'group_gid';
export const RANGES: RangeKey[] = ['uid', 'gid', 'group_gid'];

/** The namespace a range's values live in. */
const rangeNamespace = (range: RangeKey): NamespaceKey =>
  range === 'uid' ? 'uid' : 'gid';

export interface PoolFormValues {
  // Each range is optional but all-or-nothing; at least one must be defined.
  min_uid?: number | null;
  max_uid?: number | null;
  min_gid?: number | null;
  max_gid?: number | null;
  // Optional, and drawn on only by a service provider pool.
  min_group_gid?: number | null;
  max_group_gid?: number | null;
  // The form's scope; an offering pool has no project group range.
  scope?: string;
}

/** A numeric pool field by name, for code that loops over the namespaces. */
export const poolValue = (
  pool: PosixIdPool | PoolFormValues,
  key: string,
): number | null | undefined => (pool as Record<string, any>)[key];

/**
 * A range end as typed: number inputs hand over strings, and a cleared input
 * an empty string. Compared as strings, 9000 would sort above 10000.
 */
export const toId = (value: unknown): number | null =>
  value == null || value === '' ? null : Number(value);

/** A utilisation percentage as the pool views show it: one decimal at most. */
export const roundUtilization = (value?: number | null) =>
  Math.round((value ?? 0) * 10) / 10;

export const scopeLabel = (pool: PosixIdPool) =>
  pool.scope === 'offering'
    ? translate('offering pool')
    : translate('service provider pool');

/**
 * Form validation mirroring the backend's checks, so a range that would be
 * refused is flagged while typing: both ends or neither, at least one of the
 * UID and GID ranges, the global bounds, no overlap between the group range and
 * the pool's own GID range, and no overlap with the provider's other pools
 * within the same namespace. Whether a shrunk range still holds every allocated value is
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
    for (const ns of RANGES) {
      if (ns === 'group_gid' && values.scope === 'offering') {
        continue;
      }
      const min = toId(poolValue(values, `min_${ns}`));
      const max = toId(poolValue(values, `max_${ns}`));
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
      if (ns !== 'group_gid') {
        complete += 1;
      }
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
      if (ns === 'group_gid') {
        const gidMin = toId(values.min_gid);
        const gidMax = toId(values.max_gid);
        if (
          gidMin != null &&
          gidMax != null &&
          min <= gidMax &&
          max >= gidMin
        ) {
          errors.min_group_gid = translate(
            'Overlaps this pool’s GID range {min}–{max}.',
            { min: gidMin, max: gidMax },
          );
          continue;
        }
      }
      // A range clashes with every range of another pool in the same
      // namespace: a group GID range with GID ranges too.
      const clashing = siblings
        .flatMap((other) =>
          RANGES.filter(
            (range) => rangeNamespace(range) === rangeNamespace(ns),
          ).map((range) => ({ other, range })),
        )
        .find(
          ({ other, range }) =>
            poolValue(other, `min_${range}`) != null &&
            (poolValue(other, `min_${range}`) as number) <= max &&
            (poolValue(other, `max_${range}`) as number) >= min,
        );
      if (clashing) {
        errors[`min_${ns}`] = translate(
          'Overlaps {min}–{max} of another {scope}.',
          {
            min: poolValue(clashing.other, `min_${clashing.range}`),
            max: poolValue(clashing.other, `max_${clashing.range}`),
            scope: scopeLabel(clashing.other),
          },
        );
      }
    }
    // A group range alone does not make a pool: it needs a UID or GID range.
    const namespaceErrors = NAMESPACES.some(
      (ns) => errors[`min_${ns}`] || errors[`max_${ns}`],
    );
    if (!complete && !namespaceErrors) {
      errors.min_uid = translate(
        'Define at least one of the UID or GID ranges.',
      );
    }
    return errors;
  };
