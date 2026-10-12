import { Col, Row } from 'react-bootstrap';

import { formatUsageValue } from '@/core/formatNumber';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

import { getUsagePercentOfLimitComponent } from './QuotaCell';
import { QuotaProgressBar } from './QuotaProgressBar';

interface QuotaSingleView {
  usage: number | string;
  limit?: number | string;
  title: any;
  billingType?: string;
  limitFrequency?: string;
  displayUnit?: string;
  // Two components share the width, so details stack as label/value rows
  // instead of spreading out in columns.
  stacked?: boolean;
}

export const QuotaSingleView = ({
  usage,
  limit,
  title,
  billingType,
  limitFrequency,
  displayUnit,
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
  ].filter(Boolean);

  return (
    <div className="d-flex flex-column">
      <span className="fw-bold text-dark text-nowrap ellipsis">
        {limit
          ? `${formatUsageValue(usage)} / ${formatUsageValue(limit)}`
          : formatUsageValue(usage)}{' '}
        {title}
      </span>
      <QuotaProgressBar
        percent={percent}
        className="mt-2"
        label={typeof title === 'string' ? title : undefined}
      />
      {stacked ? (
        <div className="mt-3">
          {details.map((detail) => (
            <Field
              key={detail.label}
              label={detail.label}
              value={detail.value}
              labelCol={6}
              valueCol={6}
            />
          ))}
        </div>
      ) : (
        <Row className="mt-3">
          {details.map((detail) => (
            <Col key={detail.label}>
              <span className="text-gray-700 fw-bold d-block mb-1">
                {detail.label}:
              </span>
              <span className="text-gray-500">{detail.value}</span>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};
