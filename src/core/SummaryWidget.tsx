import classNames from 'classnames';
import { ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';

import { StatsCard } from './StatsCard';

export const SummaryWidget = ({
  stats,
  className,
}: {
  stats: Array<{ label: ReactNode; value: ReactNode }>;
  // Callers outside a padded container (e.g. a TableWithTabs pane) pass `mx-0`
  // to cancel the row's negative gutter margins, which would otherwise bleed
  // past the pane and get clipped by its overflow.
  className?: string;
}) => {
  const colWidth =
    stats.length === 5
      ? null
      : Math.max(2, Math.floor(12 / Math.min(stats.length, 6)));

  return (
    <Row className={classNames('g-4 mb-5', className)}>
      {stats.map((stat, index) => (
        <Col key={index} sm={colWidth}>
          <StatsCard label={stat.label} value={stat.value} />
        </Col>
      ))}
    </Row>
  );
};
