import { FC } from 'react';
import { Card } from 'react-bootstrap';

interface StatisticsCardProps {
  title: string;
  value: number;
}

export const StatisticsCard: FC<StatisticsCardProps> = ({ title, value }) => (
  <Card className="card-bordered mb-5">
    <Card.Body>
      <span className="block text-quaternary mb-3">{title}</span>
      <h1 className="block text-2xl mb-0 text-primary">{value}</h1>
    </Card.Body>
  </Card>
);
