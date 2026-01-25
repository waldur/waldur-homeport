import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChartLineUpIcon,
  CalendarIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { GrowthStats } from './types';

interface StatCardProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

const StatCard: FC<StatCardProps> = ({
  icon,
  iconColor,
  label,
  value,
  change,
  changeLabel,
}) => {
  const isPositiveChange = change !== undefined && change >= 0;
  const changeColor = isPositiveChange ? '#50cd89' : '#f1416c';

  return (
    <div className="card card-flush h-100">
      <div className="card-body d-flex align-items-center py-5">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle me-4"
          style={{
            width: 50,
            height: 50,
            backgroundColor: `${iconColor}15`,
          }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <div className="flex-grow-1">
          <div className="fs-2 fw-bold">{value}</div>
          <div className="text-muted fs-7">{label}</div>
        </div>
        {change !== undefined && (
          <div className="text-end">
            <div
              className="d-flex align-items-center justify-content-end"
              style={{ color: changeColor }}
            >
              {isPositiveChange ? (
                <ArrowUpIcon size={16} weight="bold" />
              ) : (
                <ArrowDownIcon size={16} weight="bold" />
              )}
              <span className="fw-bold ms-1">
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
            {changeLabel && (
              <div className="text-muted fs-8">{changeLabel}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface GrowthSummaryCardsProps {
  stats: GrowthStats;
  year: number;
}

export const GrowthSummaryCards: FC<GrowthSummaryCardsProps> = ({
  stats,
  year,
}) => {
  return (
    <Row className="g-4 mb-6">
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          icon={<ChartLineUpIcon size={24} weight="bold" />}
          iconColor="#009ef7"
          label={translate('Total usage ({year})', { year })}
          value={stats.totalUsage.toLocaleString()}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          icon={<TrendUpIcon size={24} weight="bold" />}
          iconColor="#50cd89"
          label={translate('Year-over-year')}
          value={`${stats.yearOverYearGrowth >= 0 ? '+' : ''}${stats.yearOverYearGrowth.toFixed(1)}%`}
          change={stats.yearOverYearGrowth}
          changeLabel={translate('vs {year}', { year: year - 1 })}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          icon={<TrendUpIcon size={24} weight="bold" />}
          iconColor="#ffc700"
          label={translate('Month-over-month')}
          value={`${stats.monthOverMonthGrowth >= 0 ? '+' : ''}${stats.monthOverMonthGrowth.toFixed(1)}%`}
          change={stats.monthOverMonthGrowth}
          changeLabel={translate('latest')}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          icon={<CalendarIcon size={24} weight="bold" />}
          iconColor="#7239ea"
          label={translate('Peak month')}
          value={stats.peakMonth || '-'}
        />
      </Col>
    </Row>
  );
};
