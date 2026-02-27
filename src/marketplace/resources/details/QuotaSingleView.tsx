import { formatUsageValue } from '@waldur/core/formatNumber';
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
  displayUnit?: string;
}

export const QuotaSingleView = ({
  usage,
  limit,
  units,
  title,
  billingType,
  limitFrequency,
  displayUnit,
}: QuotaSingleView) => {
  const percent = getUsagePercentOfLimitComponent(limit, usage);

  return (
    <div className="d-flex flex-column">
      <span className="fw-bold fs-7 text-muted text-nowrap ellipsis">
        {title}
      </span>
      <span className="fw-bold text-dark text-nowrap ellipsis">
        {limit
          ? `${formatUsageValue(usage)} / ${formatUsageValue(limit)}`
          : formatUsageValue(usage)}
        {units && ` ${units}`}
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
        {displayUnit && (
          <div>
            <span className="fw-bold d-block mb-1">
              {translate('Measured in')}:
            </span>
            <span className="text-muted">{displayUnit}</span>
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
