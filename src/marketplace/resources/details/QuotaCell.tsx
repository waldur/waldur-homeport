import { QuestionIcon } from '@phosphor-icons/react';
import { ProgressBar } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

interface QuotaCellProps {
  usage: number | string;
  limit?: number | string;
  units?: string;
  title: any;
  description?: string;
}

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
          <QuestionIcon />
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
  const limitValue =
    limit === undefined || limit === null
      ? Infinity
      : Number(limit) === 0
        ? Number(usage)
        : Number(limit);
  const percent = Math.round((Number(usage) / limitValue) * 100);
  return (
    <div className="d-flex flex-column mb-3">
      <CellDescription
        title={title}
        usage={usage}
        limit={limit}
        description={description}
        units={units}
      />

      <ProgressBar
        variant={percent < 33 ? 'primary' : percent < 66 ? 'warning' : 'danger'}
        now={percent}
        className="h-4px resource-progress shadow-none w-100 mt-1"
      />
    </div>
  );
};
