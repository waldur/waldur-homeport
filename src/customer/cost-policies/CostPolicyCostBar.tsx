import { FC } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { CostPolicyFigures } from './costPolicyDetails';

interface Segment {
  key: string;
  label: string;
  value: number;
  color: string;
}

// Drawn from the theme's colour ramps, as the dashboard charts are.
const EARLIER_COLOR = 'var(--color-error-600)';
const THIS_MONTH_COLOR = 'var(--color-warning-400)';

/** The cost after credit as a bar against the limit: the earlier months'
 * uncovered cost, then the current month's part. For a viewer who may not
 * see the earlier invoices month by month (CostPolicyMonthStrip). */
export const CostPolicyCostBar: FC<{ figures: CostPolicyFigures }> = ({
  figures,
}) => {
  const segments: Segment[] = [
    ...(figures.earlier > 0
      ? [
          {
            key: 'earlier',
            label: translate('Earlier months, not covered'),
            value: figures.earlier,
            color: EARLIER_COLOR,
          },
        ]
      : []),
    ...(figures.thisMonth > 0
      ? [
          {
            key: 'this-month',
            label: translate('This month, not covered'),
            value: figures.thisMonth,
            color: THIS_MONTH_COLOR,
          },
        ]
      : []),
  ];
  const scale = Math.max(figures.current, figures.limit) * 1.1 || 1;
  const limitAt = (figures.limit / scale) * 100;

  return (
    <div data-testid="cost-policy-cost-bar">
      <div className="relative pt-6">
        <div
          className="absolute top-0 text-xs text-secondary whitespace-nowrap"
          style={{
            left: `${limitAt}%`,
            // Kept inside the bar at either end, where centring would clip it.
            transform:
              limitAt > 70
                ? 'translateX(-100%)'
                : limitAt < 15
                  ? 'none'
                  : 'translateX(-50%)',
          }}
        >
          {translate('Limit {limit}', {
            limit: defaultCurrency(figures.limit),
          })}
        </div>
        <div className="flex h-6 w-full overflow-hidden rounded-md bg-secondary">
          {segments.map((segment) => (
            <div
              key={segment.key}
              className="h-full border-r-[2px] border-r-primary last:border-r-0"
              style={{
                width: `${(segment.value / scale) * 100}%`,
                backgroundColor: segment.color,
              }}
              title={`${segment.label}: ${defaultCurrency(segment.value)}`}
            />
          ))}
        </div>
        <div
          className="absolute top-5 bottom-0 border-l-[2px] border-dashed border-l-primary"
          style={{ left: `${limitAt}%` }}
          aria-hidden
        />
      </div>
      <ul className="mt-3 mb-0 flex flex-wrap gap-x-5 gap-y-1 ps-0 text-sm">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2">
            <span
              className="inline-block size-3 rounded-sm"
              style={{ backgroundColor: segment.color }}
              aria-hidden
            />
            <span className="text-secondary">{segment.label}</span>
            <span className="font-medium">
              {defaultCurrency(segment.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
