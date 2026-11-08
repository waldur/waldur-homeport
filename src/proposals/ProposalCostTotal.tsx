import { FC } from 'react';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { formatUsageValue } from '@/core/formatNumber';
import { Panel } from '@/core/Panel';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { getRequestedLines } from '@/proposals/provider-calls/requestedLines';

import { getLongestPrepaidMonths } from './prepaidDuration';
import { formatProjectDuration, getProjectDuration } from './projectDuration';
import { sumRequestedResourceCosts } from './requestedResourceCost';

interface ProposalCostTotalProps {
  rows: any[];
  /** The call's fixed duration, stated when no subscription sets a longer one. */
  fixedDurationDays?: number | null;
  /** The length chosen from the call's list, in months, where it offers one. */
  chosenDurationMonths?: number | null;
  /** Fills its container instead of sitting against the table's right edge. */
  panel?: boolean;
  /** The panel's heading; says what is totalled when it is not the request. */
  title?: string;
  /** Lists the amounts per offering as well: for an offering team, which
   *  reads only its own offerings and may see no prices at all. */
  listsAmounts?: boolean;
}

/** The amounts asked of (or awarded on) each offering, grouped by offering. */
const AmountsByOffering: FC<{ rows: any[] }> = ({ rows }) => {
  const byOffering = new Map<string, { name: string; rows: any[] }>();
  for (const row of rows) {
    const offering = row.requested_offering;
    const key = offering?.uuid ?? '';
    const group = byOffering.get(key) ?? {
      name: offering?.offering_name ?? '',
      rows: [],
    };
    group.rows.push(row);
    byOffering.set(key, group);
  }
  return (
    <>
      {[...byOffering.entries()].map(([key, group]) => {
        const lines = group.rows.flatMap((row) =>
          getRequestedLines(row.limits, row.requested_offering?.components),
        );
        return lines.length ? (
          <PropertyItem
            key={key}
            label={group.name}
            value={
              <ul className="list-unstyled mb-0">
                {lines.map((line, i) => (
                  <li key={`${line.key}-${i}`}>
                    <span className="text-quaternary">{line.label}: </span>
                    {[formatUsageValue(line.amount), line.unit]
                      .filter(Boolean)
                      .join(' ')}
                  </li>
                ))}
              </ul>
            }
          />
        ) : null;
      })}
    </>
  );
};

/** What the proposal adds up to, and how long the project it awards will run. */
export const ProposalCostTotal: FC<ProposalCostTotalProps> = ({
  rows,
  fixedDurationDays,
  chosenDurationMonths,
  panel,
  title,
  listsAmounts,
}) => {
  const total = sumRequestedResourceCosts(rows ?? []);
  const duration = getProjectDuration(
    getLongestPrepaidMonths(rows),
    fixedDurationDays,
    chosenDurationMonths,
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
  const showsAmounts = Boolean(listsAmounts) && rows?.length > 0;
  if (!showsFigures && !duration && !showsAmounts) {
    return null;
  }

  const body = (
    <>
      <PropertyList variant="summary" stacked space={2.5}>
        {showsAmounts && <AmountsByOffering rows={rows} />}
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
      <div className="border-t border-t-secondary pt-2.5 min-w-80">{body}</div>
    </div>
  );
};
