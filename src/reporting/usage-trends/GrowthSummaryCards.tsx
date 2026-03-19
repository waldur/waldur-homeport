import { ArrowUpIcon, ArrowDownIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { renderFieldOrDash } from '@waldur/table/utils';

import { GrowthStats } from './types';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

const StatCard: FC<StatCardProps> = ({ label, value, change, changeLabel }) => {
  const isPositiveChange = change !== undefined && change >= 0;
  const changeColor = isPositiveChange ? '#50cd89' : '#f1416c';

  return (
    <div className="card card-flush card-bordered h-100">
      <div className="card-body d-flex py-5 flex-column">
        <div className="fs-4 fw-bold">{label}</div>
        <div className="flex-grow-1 mt-10">
          <h1 style={{ fontSize: '32px' }}>{value}</h1>
        </div>
        {change !== undefined && (
          <div>
            <span style={{ color: changeColor }}>
              {isPositiveChange ? (
                <ArrowUpIcon size={16} weight="bold" />
              ) : (
                <ArrowDownIcon size={16} weight="bold" />
              )}
              <span className="fw-bold mx-2">
                {Math.abs(change).toFixed(1)}%
              </span>
            </span>
            {changeLabel && <span className="text-muted">{changeLabel}</span>}
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
          label={translate('Total usage ({year})', { year })}
          value={stats.totalUsage.toLocaleString()}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          label={translate('Year-over-year')}
          value={`${stats.yearOverYearGrowth >= 0 ? '+' : ''}${stats.yearOverYearGrowth.toFixed(1)}%`}
          change={stats.yearOverYearGrowth}
          changeLabel={translate('vs {year}', { year: year - 1 })}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          label={translate('Month-over-month')}
          value={`${stats.monthOverMonthGrowth >= 0 ? '+' : ''}${stats.monthOverMonthGrowth.toFixed(1)}%`}
          change={stats.monthOverMonthGrowth}
          changeLabel={translate('latest')}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          label={translate('Peak month')}
          value={renderFieldOrDash(stats.peakMonth)}
        />
      </Col>
    </Row>
  );
};
