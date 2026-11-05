import { PropertyList, PropertyItem } from 'waldur-ui';

import { formatUsageValue } from '@/core/formatNumber';
import { translate } from '@/i18n';

import { getUsagePercentOfLimitComponent } from './QuotaCell';
import { QuotaProgressBar } from './QuotaProgressBar';

interface QuotaSingleView {
  usage: number | string;
  limit?: number | string;
  title: any;
  billingType?: string;
  limitFrequency?: string;
  displayUnit?: string;
  // When a spending limit's period starts from zero.
  resets?: string;
  // Two components share the width, so details stack as label/value rows
  // instead of spreading out in columns. Each column can be as narrow as
  // ~160px, so label and value split it in halves: a fixed term width plus
  // the row gap would leave the value no room at all.
  stacked?: boolean;
}

export const QuotaSingleView = ({
  usage,
  limit,
  title,
  billingType,
  limitFrequency,
  displayUnit,
  resets,
  stacked,
}: QuotaSingleView) => {
  const percent = getUsagePercentOfLimitComponent(limit, usage);

  const details = [
    // Volumes carry no billing settings, only a size.
    billingType && { label: translate('Type'), value: billingType },
    displayUnit && { label: translate('Unit'), value: displayUnit },
    limitFrequency && {
      label: translate('Limit period'),
      value: limitFrequency,
    },
    resets && { label: translate('Resets'), value: resets },
  ].filter(Boolean);

  return (
    <div className="flex flex-col">
      <span className="font-medium text-primary whitespace-nowrap ellipsis">
        {limit
          ? `${formatUsageValue(usage)} / ${formatUsageValue(limit)}`
          : formatUsageValue(usage)}{' '}
        {title}
      </span>
      <QuotaProgressBar
        percent={percent}
        className="mt-1.5"
        label={typeof title === 'string' ? title : undefined}
      />
      {stacked ? (
        <PropertyList variant="summary" className="mt-2.5" termWidth="50%">
          {details.map((detail) => (
            <PropertyItem
              key={detail.label}
              className="sm:gap-0"
              label={detail.label}
              value={detail.value}
            />
          ))}
        </PropertyList>
      ) : (
        <div className="flex flex-wrap *:flex-1 mt-2.5 gap-x-5">
          {details.map((detail) => (
            <div key={detail.label}>
              <span className="text-secondary font-medium block mb-1">
                {detail.label}:
              </span>
              <span className="text-quaternary">{detail.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
