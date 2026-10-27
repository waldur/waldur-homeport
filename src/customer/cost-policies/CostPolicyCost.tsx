import { DateTime } from 'luxon';
import { FC } from 'react';
import { EarlierInvoiceMonth } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { CostPolicyCostBar } from './CostPolicyCostBar';
import { CostPolicyFigures } from './costPolicyDetails';
import { CostPolicyMonthStrip } from './CostPolicyMonthStrip';
import { policyPeriodOptions } from './utils';

const PERIOD_MONTHS = {
  [policyPeriodOptions.oneMonth.value]: 1,
  [policyPeriodOptions.threeMonth.value]: 3,
  [policyPeriodOptions.twelveMonth.value]: 12,
};

/** The closed months inside the policy's period. */
const monthsInPeriod = (
  months: EarlierInvoiceMonth[],
  period: number | undefined,
  today: DateTime,
) => {
  const count = PERIOD_MONTHS[period];
  if (!count) {
    return months;
  }
  const first = today
    .startOf('month')
    .minus({ months: count - 1 })
    .toISODate();
  return months.filter((month) => month.period >= first);
};

/** The cost the policy compares with its limit, month by month when the
 * viewer may see the earlier invoices and they account for the earlier part;
 * otherwise as one bar of the earlier months and this month. */
export const CostPolicyCost: FC<{
  policy;
  figures: CostPolicyFigures;
  months?: EarlierInvoiceMonth[] | null;
  today?: DateTime;
}> = ({ policy, figures, months, today = DateTime.now() }) => {
  const counted = months ? monthsInPeriod(months, policy.period, today) : null;
  const countedUncovered = (counted ?? []).reduce(
    (sum, month) => sum + Number(month.uncovered),
    0,
  );
  // A credit period narrower than the policy's lists fewer months than the
  // policy counts; the months then do not explain the figure.
  if (counted && Math.abs(countedUncovered - figures.earlier) < 0.01) {
    return (
      <CostPolicyMonthStrip figures={figures} months={counted} today={today} />
    );
  }
  return (
    <>
      <CostPolicyCostBar figures={figures} />
      <p className="mt-2 mb-0">{getCostSumText(figures)}</p>
    </>
  );
};

/** The sum under the bar, naming only the parts there are: "€0.00 this
 * month" in a sum explains nothing. */
const getCostSumText = (figures: CostPolicyFigures) => {
  const values = {
    earlier: defaultCurrency(figures.earlier),
    thisMonth: defaultCurrency(figures.thisMonth),
    total: defaultCurrency(figures.current),
    limit: defaultCurrency(figures.limit),
  };
  const over = figures.current > figures.limit;
  if (figures.earlier > 0 && figures.thisMonth > 0) {
    return over
      ? translate(
          'The policy adds up what credit did not cover: {earlier} in earlier months and {thisMonth} this month = {total}, over the {limit} limit.',
          values,
        )
      : translate(
          'The policy adds up what credit did not cover: {earlier} in earlier months and {thisMonth} this month = {total}, at or below the {limit} limit.',
          values,
        );
  }
  if (figures.earlier > 0) {
    return over
      ? translate(
          'The policy counts what credit did not cover: {total} in earlier months, over the {limit} limit.',
          values,
        )
      : translate(
          'The policy counts what credit did not cover: {total} in earlier months, at or below the {limit} limit.',
          values,
        );
  }
  if (figures.thisMonth > 0) {
    return over
      ? translate(
          'The policy counts what credit did not cover: {total} this month, over the {limit} limit.',
          values,
        )
      : translate(
          'The policy counts what credit did not cover: {total} this month, at or below the {limit} limit.',
          values,
        );
  }
  return translate(
    'Credit covered every month, so the policy counts nothing against its {limit} limit.',
    values,
  );
};
