import { ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';

import { StatsCard } from './StatsCard';

export const SummaryWidget = ({
  stats,
}: {
  stats: Array<{ label: ReactNode; value: ReactNode }>;
}) => {
  const colWidth = Math.max(2, Math.floor(12 / Math.min(stats.length, 6)));

  return (
    <Row className="g-4 mb-6">
      {stats.map((stat, index) => (
        <Col key={index} xs={12} sm={colWidth}>
          <StatsCard label={stat.label} value={stat.value} />
        </Col>
      ))}
    </Row>
  );
};
