import { FC } from 'react';
import { Card } from 'react-bootstrap';

interface StatisticsCardProps {
  title: string;
  value: number;
}

export const StatisticsCard: FC<StatisticsCardProps> = ({ title, value }) => (
  <Card className="card-bordered mb-4">
    <Card.Body>
      <span className="block text-quaternary mb-2.5">{title}</span>
      <h1 className="block text-2xl mb-0 text-primary">{value}</h1>
    </Card.Body>
  </Card>
);
