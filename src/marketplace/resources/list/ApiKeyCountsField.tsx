import { FC } from 'react';
import { Resource } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

/**
 * How many keys a resource has, and how many of them are paused or erred,
 * e.g. "4 · 1 paused". Links to the provider's key list for that resource.
 */
export const formatApiKeyCounts = (
  counts: Resource['api_key_counts'] | undefined,
): string | undefined => {
  const total = Object.values(counts ?? {}).reduce((sum, n) => sum + n, 0);
  if (!total) {
    return undefined;
  }
  const notes = [
    counts.Paused && translate('{count} paused', { count: counts.Paused }),
    counts.Erred && translate('{count} erred', { count: counts.Erred }),
  ].filter(Boolean);
  return [String(total), ...notes].join(' · ');
};

export const ApiKeyCountsField: FC<{
  counts: Resource['api_key_counts'] | undefined;
  providerUuid: string | undefined;
  resourceUuid: string;
}> = ({ counts, providerUuid, resourceUuid }) => {
  const label = formatApiKeyCounts(counts);
  if (!label) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  return providerUuid ? (
    <Link
      state="marketplace-provider-api-keys"
      params={{ uuid: providerUuid, resource_uuid: resourceUuid }}
      label={label}
    />
  ) : (
    <>{label}</>
  );
};
