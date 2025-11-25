import { QuestionIcon } from '@phosphor-icons/react';

import { Tip } from '@waldur/core/Tooltip';

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
  <span className="fw-bolder fs-7 text-dark text-nowrap ellipsis">
    {description && (
      <>
        <Tip id="quota" label={description} className="aligned-tip">
          <QuestionIcon weight="bold" />
        </Tip>{' '}
      </>
    )}
    {limit
      ? `${usage.toLocaleString()}/${limit.toLocaleString()}`
      : usage.toLocaleString()}
    {units && ` ${units}`}

    {title && ` ${title}`}
  </span>
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
