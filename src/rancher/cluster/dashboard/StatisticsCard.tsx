import { FC } from 'react';
import { Card } from 'react-bootstrap';

interface StatisticsCardProps {
  title: string;
  value: number;
}

export const StatisticsCard: FC<StatisticsCardProps> = ({ title, value }) => (
  <Card className="card-bordered mb-5">
    <Card.Body>
      <span className="d-block text-muted mb-3">{title}</span>
      <h1 className="d-block fs-1x mb-0 text-dark">{value}</h1>
    </Card.Body>
  </Card>
);
