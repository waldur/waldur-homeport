import { HelpIcon } from 'waldur-ui';

import { formatUsageValue } from '@/core/formatNumber';

import { QuotaProgressBar } from './QuotaProgressBar';

interface QuotaCellProps {
  usage: number | string;
  limit?: number | string;
  units?: string;
  title: any;
  description?: string;
}

export const getUsagePercentOfLimitComponent = (limit, usage) => {
  const limitValue =
    limit === undefined || limit === null
      ? Infinity
      : Number(limit) === 0
        ? Number(usage)
        : Number(limit);
  return Math.round((Number(usage) / limitValue) * 100);
};

const CellDescription = ({
  usage,
  limit,
  units,
  title,
  description,
}: QuotaCellProps) => (
  <>
    {/* The help icon sits beside the title, not in it: a long title is cut
        off at the end, and the icon with it. */}
    <span className="flex min-w-0 items-center gap-1">
      <span
        className="min-w-0 font-semibold text-xs text-primary whitespace-nowrap ellipsis"
        title={typeof title === 'string' ? title : undefined}
      >
        {title}
      </span>
      {description && <HelpIcon label={description} />}
    </span>
    <span className="font-semibold text-xs text-primary whitespace-nowrap ellipsis">
      {limit
        ? `${formatUsageValue(usage)}/${formatUsageValue(limit)}`
        : formatUsageValue(usage)}
      {units && ` ${units}`}
    </span>
  </>
);

export const QuotaCell = ({
  usage,
  limit,
  units,
  title,
  description,
}: QuotaCellProps) => {
  const percent = getUsagePercentOfLimitComponent(limit, usage);

  return (
    <div className="flex flex-col mb-2.5">
      <CellDescription
        title={title}
        usage={usage}
        limit={limit}
        description={description}
        units={units}
      />

      <QuotaProgressBar
        percent={percent}
        size="xs"
        className="mt-1"
        label={typeof title === 'string' ? title : undefined}
      />
    </div>
  );
};
