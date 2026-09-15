import { QuestionIcon } from '@phosphor-icons/react';

import { Tooltip } from 'waldur-ui';

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
    <span className="fw-bolder fs-7 text-dark text-nowrap ellipsis">
      {title}
      {description && (
        <>
          {' '}
          <Tooltip label={description}>
            <QuestionIcon weight="bold" className="aligned-tip" />
          </Tooltip>
        </>
      )}
    </span>
    <span className="fw-bolder fs-7 text-dark text-nowrap ellipsis">
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
    <div className="d-flex flex-column mb-3">
      <CellDescription
        title={title}
        usage={usage}
        limit={limit}
        description={description}
        units={units}
      />

      <QuotaProgressBar percent={percent} height={4} className="mt-1" />
    </div>
  );
};
