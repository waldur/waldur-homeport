import { FC } from 'react';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { Panel } from '@/core/Panel';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import { getLongestPrepaidMonths } from './prepaidDuration';
import { formatProjectDuration, getProjectDuration } from './projectDuration';
import { sumRequestedResourceCosts } from './requestedResourceCost';

interface ProposalCostTotalProps {
  rows: any[];
  /** The call's fixed duration, stated when no subscription sets a longer one. */
  fixedDurationDays?: number | null;
  /** Fills its container instead of sitting against the table's right edge. */
  panel?: boolean;
  /** The panel's heading; says what is totalled when it is not the request. */
  title?: string;
}

/** What the proposal adds up to, and how long the project it awards will run. */
export const ProposalCostTotal: FC<ProposalCostTotalProps> = ({
  rows,
  fixedDurationDays,
  panel,
  title,
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
      <PropertyList variant="summary" stacked space={2.5}>
        {showsFigures && (
          <>
            {Boolean(total.monthly) && (
              <PropertyItem
                label={translate('Recurring total')}
                value={
                  <>
                    {defaultCurrency(total.monthly)}
                    <span className="text-quaternary">{translate(' /mo')}</span>
                  </>
                }
              />
            )}
            {Boolean(total.oneTime) && (
              <PropertyItem
                label={translate('Subscriptions and one-time')}
                value={propVal.currency(total.oneTime)}
              />
            )}
          </>
        )}
        {duration && (
          // What allocation will grant: the longest subscription requested, or
          // the call's fixed duration where nothing prepaid was asked for.
          <PropertyItem
            label={translate('Project duration')}
            value={formatProjectDuration(duration)}
            space={0}
          />
        )}
      </PropertyList>
      {showsFigures && (
        // Recurring plus one-time, the sum the checkout's own total card shows,
        // so the two pages do not define "total" differently.
        <div className="border-b border-b-secondary my-3" />
      )}
      {showsFigures && (
        <div className="flex justify-between items-center text-lg">
          <span className="font-normal text-secondary">
            {translate('Total')}:
          </span>
          <span className="font-medium text-primary">
            {defaultCurrency(total.monthly + total.oneTime)}
          </span>
        </div>
      )}
    </>
  );

  if (panel) {
    return (
      <Panel
        title={title ?? translate('Summary')}
        cardBordered
        className="mb-4"
      >
        {body}
      </Panel>
    );
  }
  return (
    <div className="flex justify-end mt-3">
      <div
        className="border-t border-t-secondary pt-2.5"
        style={{ minWidth: 320 }}
      >
        {body}
      </div>
    </div>
  );
};
