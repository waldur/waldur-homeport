import React from 'react';

import { Card, CardContent } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';

interface StatisticsCardProps {
  title: string;
  value: number;
  to?: { state: string; params?: object };
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  to,
}) => (
  <Card bordered className="mb-4">
    <CardContent className="flex md:block justify-between items-center">
      {to && (
        <div className="text-end order-2">
          <Link state={to.state} params={to.params} buttonVariant="tertiary">
            {translate('View all')}
          </Link>
        </div>
      )}
      <div className="mb-3 order-1">
        <strong className="block display-4 text-success">{value}</strong>
        <strong className="block mb-1.5">{title}</strong>
      </div>
    </CardContent>
  </Card>
);
