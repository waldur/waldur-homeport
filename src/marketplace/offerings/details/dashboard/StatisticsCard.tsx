import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Progress, Tooltip } from 'waldur-ui';

import { formatUsageValue } from '@/core/formatNumber';
import { translate } from '@/i18n';
import { ChangesAmountBadge } from '@/marketplace/service-providers/dashboard/ChangesAmountBadge';

interface StatisticsCardProps {
  title: string;
  value: number;
  max?: number;
  unit?: string;
  changes?: number;
}

export const StatisticsCard: FC<StatisticsCardProps> = ({
  title,
  value,
  max,
  unit,
  changes,
}) => {
  const variant = changes
    ? null
    : value < 33
      ? 'primary'
      : value < 66
        ? 'warning'
        : 'danger';
  return (
    <Card className="card-bordered mb-5">
      <Card.Body>
        <p className="text-sm font-medium text-quaternary mb-1">{title}</p>
        <div className="flex justify-between items-end">
          <h1 className="display-6 mb-0">
            {formatUsageValue(value, true)}
            <span className="ms-1 text-xl font-medium">{unit}</span>
          </h1>
          {changes ? (
            <Tooltip label={translate('Changes in the last month')}>
              <span className="mb-1">
                <ChangesAmountBadge
                  changes={changes}
                  asBadge
                  fractionDigits={0}
                />
              </span>
            </Tooltip>
          ) : max ? (
            <div className="grow max-w-[80px] mb-3">
              <Progress
                value={value}
                max={max}
                variant={variant ?? undefined}
              />
            </div>
          ) : null}
        </div>
      </Card.Body>
    </Card>
  );
};
