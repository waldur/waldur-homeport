import { ManagedProject } from 'waldur-js-client';

const embargoedUntil = (row: ManagedProject): string | null => {
  const earliest = row.details?.earliest_approve;
  if (earliest && new Date(earliest) > new Date()) {
    return earliest;
  }
  return null;
};

export const isEmbargoed = (row: ManagedProject): boolean =>
  embargoedUntil(row) !== null;
