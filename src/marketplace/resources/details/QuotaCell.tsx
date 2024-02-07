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
  description,
}: Omit<QuotaCellProps, 'title'>) => (
  <span className="fw-bold text-nowrap">
    {limit
      ? `${usage.toLocaleString()}/${limit.toLocaleString()}`
      : usage.toLocaleString()}
    {units && ` ${units}`}
    {description && (
      <>
        {' '}
        <Tip id="quota" label={description}>
          <i className="fa fa-question-circle" />
        </Tip>
      </>
    )}
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
    <div className="d-flex flex-column align-items-center mb-4">
      <CellDescription
        usage={usage}
        limit={limit}
        description={description}
        units={units}
      />
      <ProgressBar
        variant={percent < 33 ? 'success' : percent < 66 ? 'warning' : 'danger'}
        now={percent}
        className="h-6px w-100 mw-125px my-2"
      />
      <p className="text-muted fw-bold mb-0">{title}</p>
    </div>
  );
};
