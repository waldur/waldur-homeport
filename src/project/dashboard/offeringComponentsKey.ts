import { uniq } from 'lodash-es';

/**
 * React Query key parts for the components of the offerings behind a set of
 * resource rows: the full offering UUIDs, deduplicated and sorted so the same
 * set of offerings always maps to the same cache entry. A UUID prefix is not
 * enough: offerings that share one would share a cache entry, and a project
 * would read another project's offerings.
 */
export const getOfferingComponentsKey = (
  rows: { offering_uuid: string }[],
): string[] => uniq(rows.map((row) => row.offering_uuid)).sort();
