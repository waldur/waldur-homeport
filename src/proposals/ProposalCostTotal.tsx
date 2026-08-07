import { FC } from 'react';

import { translate } from '@/i18n';

import { sumRequestedResourceCosts } from './requestedResourceCost';
import { RequestedResourceCostLabel } from './RequestedResourceCostLabel';

interface ProposalCostTotalProps {
  rows: any[];
  /** Total the endpoint reports, which may exceed the page currently loaded. */
  resultCount?: number;
}

/**
 * Expected cost of everything the proposal asks for.
 *
 * Suppressed when the table is showing only part of the list: adding up one
 * page and calling it the total would understate it without saying so.
 */
export const ProposalCostTotal: FC<ProposalCostTotalProps> = ({
  rows,
  resultCount,
}) => {
  if (!rows?.length) {
    return null;
  }
  if (typeof resultCount === 'number' && resultCount > rows.length) {
    return null;
  }
  const total = sumRequestedResourceCosts(rows);
  if (!total.known) {
    return null;
  }
  return (
    <div className="d-flex justify-content-end align-items-baseline gap-3 mt-4">
      <span className="fw-bold">{translate('Estimated total')}:</span>
      <span className="fs-5">
        <RequestedResourceCostLabel cost={total} />
      </span>
    </div>
  );
};
