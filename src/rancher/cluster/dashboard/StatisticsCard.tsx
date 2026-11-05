import { FC } from 'react';

import { Card, CardContent } from 'waldur-ui';

interface StatisticsCardProps {
  title: string;
  value: number;
}

export const StatisticsCard: FC<StatisticsCardProps> = ({ title, value }) => (
  <Card bordered className="mb-4">
    <CardContent>
      <span className="block text-quaternary mb-2.5">{title}</span>
      <h1 className="block text-2xl mb-0 text-primary">{value}</h1>
    </CardContent>
  </Card>
);
