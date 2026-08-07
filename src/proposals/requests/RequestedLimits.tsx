import { FC } from 'react';

import { titleCase } from '@/core/utils';
import { translate } from '@/i18n';

/**
 * Limits are an offering-shaped blob — TB for a storage vault, cores and hours
 * for an allocation — so the column renders whatever keys the request carries
 * rather than committing to a fixed set.
 */
export const RequestedLimits: FC<{
  limits?: Record<string, unknown>;
}> = ({ limits }) => {
  // The schema types limits as an open JSON object, so narrow before formatting.
  const entries = Object.entries(limits || {}).filter(
    (entry): entry is [string, number] => Number.isFinite(entry[1]),
  );

  if (!entries.length) {
    return <span className="text-muted">{translate('Not specified')}</span>;
  }

  return (
    <span className="d-flex flex-column">
      {entries.map(([key, value]) => (
        <span key={key} className="text-nowrap">
          {/* Component types are snake_case: cpu_hours -> Cpu hours. */}
          <span className="text-muted">
            {titleCase(key.replace(/_/g, ' '))}:{' '}
          </span>
          {value.toLocaleString()}
        </span>
      ))}
    </span>
  );
};
