import { translate } from '@waldur/i18n';

import { getUsagePercentOfLimitComponent } from './QuotaCell';
import { QuotaProgressBar } from './QuotaProgressBar';

interface QuotaSingleView {
  usage: number | string;
  limit?: number | string;
  units?: string;
  title: any;
  billingType?: string;
  limitFrequency?: string;
  currentUsage?: string;
}

export const QuotaSingleView = ({
  usage,
  limit,
  units,
  title,
  billingType,
  limitFrequency,
}: QuotaSingleView) => {
  const percent = getUsagePercentOfLimitComponent(limit, usage);

  return (
    <div className="d-flex flex-column">
      <span className="fw-bold text-dark text-nowrap ellipsis">
        {limit
          ? `${usage.toLocaleString()} / ${limit.toLocaleString()}`
          : usage.toLocaleString()}
        {units && ` ${units}`}
        {title && ` ${title}`}
      </span>
      <QuotaProgressBar percent={percent} className="mt-2" />
      <div className="d-flex justify-content-between gap-4 fs-6 mt-3">
        <div>
          <span className="fw-bold d-block mb-1">
            {translate('Billing type')}:
          </span>
          <span className="text-muted">{billingType}</span>
        </div>
        {limitFrequency && (
          <div>
            <span className="fw-bold d-block mb-1">
              {translate('Limit frequency')}:
            </span>
            <span className="text-muted">{limitFrequency}</span>
          </div>
        )}
        <div>
          <span className="fw-bold d-block mb-1">
            {translate('Current usage')}:
          </span>
          <span className="text-muted">{percent}%</span>
        </div>
      </div>
    </div>
  );
};
