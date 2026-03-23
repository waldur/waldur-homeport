import { Col, Row } from 'react-bootstrap';

import { StatsCard } from './StatsCard';

export const SummaryWidget = ({
  stats,
}: {
  stats: Array<{ label: string; value: string | number }>;
}) => {
  return (
    <Row className="g-4 mb-6">
      {stats.map((stat) => (
        <Col key={stat.label} xs={12} sm={6} lg={2}>
          <StatsCard label={stat.label} value={stat.value} />
        </Col>
      ))}
    </Row>
  );
};
