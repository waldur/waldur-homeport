import { FC } from 'react';

import { translate } from '@/i18n';
import { getMissingRequestOptions } from '@/proposals/requestedResourceOptions';

type Item = Parameters<typeof getMissingRequestOptions>[0];

/**
 * "Missing: QoS" — the required options of a request or an awarded item that
 * are not answered. The backend refuses to submit the proposal, save the
 * award or approve the decision while one is, so it is shown wherever the
 * reader can still answer it, and nowhere else.
 */
export const MissingOptionsHint: FC<{ item?: Item | null }> = ({ item }) => {
  const missing = item ? getMissingRequestOptions(item) : [];
  return missing.length ? (
    <span className="block text-xs text-danger">
      {translate('Missing: {options}', {
        options: missing.map((option) => option.label).join(', '),
      })}
    </span>
  ) : null;
};
