import { FC } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { Panel } from '@/core/Panel';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

import { getLongestPrepaidMonths } from './prepaidDuration';
import { formatProjectDuration, getProjectDuration } from './projectDuration';
import { sumRequestedResourceCosts } from './requestedResourceCost';

interface ProposalCostTotalProps {
  rows: any[];
  /** The call's fixed duration, stated when no subscription sets a longer one. */
  fixedDurationDays?: number | null;
  /** Fills its container instead of sitting against the table's right edge. */
  panel?: boolean;
}

/** What the proposal adds up to, and how long the project it awards will run. */
export const ProposalCostTotal: FC<ProposalCostTotalProps> = ({
  rows,
  fixedDurationDays,
  panel,
}) => {
  const total = sumRequestedResourceCosts(rows ?? []);
  const duration = getProjectDuration(
    getLongestPrepaidMonths(rows),
    fixedDurationDays,
  );
  const concealed = isFeatureVisible(MarketplaceFeatures.conceal_prices);
  // Priced at zero is not the same as priced: an offering billed purely on
  // usage has no amount to request, so there is nothing to total and a heading
  // with an empty box under it would say there was. Concealed prices empty the
  // box exactly the same way, leaving the duration as the only thing to report
  // — and nothing at all when there is no length to name either.
  const showsFigures =
    rows?.length > 0 &&
    total.known &&
    !concealed &&
    Boolean(total.monthly || total.oneTime);
  if (!showsFigures && !duration) {
    return null;
  }

  const body = (
    <>
      {showsFigures && (
        <>
          {Boolean(total.monthly) && (
            <Field
              label={translate('Recurring total')}
              value={
                <>
                  {defaultCurrency(total.monthly)}
                  <span className="text-muted">{translate(' /mo')}</span>
                </>
              }
              labelCol={12}
              valueCol={12}
              space={3}
            />
          )}
          {Boolean(total.oneTime) && (
            <Field
              label={translate('Subscriptions and one-time')}
              value={defaultCurrency(total.oneTime)}
              labelCol={12}
              valueCol={12}
              space={3}
            />
          )}
        </>
      )}
      {duration && (
        // What allocation will grant: the longest subscription requested, or
        // the call's fixed duration where nothing prepaid was asked for.
        <Field
          label={translate('Project duration')}
          value={formatProjectDuration(duration)}
          labelCol={12}
          valueCol={12}
          space={0}
        />
      )}
      {showsFigures && (
        // Recurring plus one-time, the sum the checkout's own total card shows,
        // so the two pages do not define "total" differently.
        <div className="separator my-4" />
      )}
      {showsFigures && (
        <div className="d-flex justify-content-between align-items-center fs-3">
          <span className="fw-normal text-gray-700">{translate('Total')}:</span>
          <span className="fw-bold text-gray-900">
            {defaultCurrency(total.monthly + total.oneTime)}
          </span>
        </div>
      )}
    </>
  );

  if (panel) {
    return (
      <Panel title={translate('Summary')} cardBordered className="mb-5">
        {body}
      </Panel>
    );
  }
  return (
    <div className="d-flex justify-content-end mt-4">
      <div className="border-top pt-3" style={{ minWidth: 320 }}>
        {body}
      </div>
    </div>
  );
};
