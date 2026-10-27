import { ArrowDownIcon, ArrowUpIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Badge } from 'waldur-ui';

interface NetworkStatisticsCardProps {
  title: string;
  value: number;
  change: number;
  isIncrease: boolean;
}

const ChangeIndicator = ({ isIncrease, change }) => {
  return isIncrease ? (
    <Badge
      variant="success"
      leftIcon={<ArrowUpIcon weight="bold" />}
      shape="pill"
      tone="outline"
    >
      {change}%
    </Badge>
  ) : (
    <Badge
      variant="danger"
      leftIcon={<ArrowDownIcon weight="bold" />}
      shape="pill"
      tone="outline"
    >
      {change}%
    </Badge>
  );
};

export const NetworkStatisticsCard: FC<NetworkStatisticsCardProps> = ({
  title,
  value,
  change,
  isIncrease = false,
}) => {
  return (
    <Card className="card-bordered mb-4">
      <Card.Body className="flex justify-between items-end gap-1.5">
        <div>
          <span className="block text-quaternary mb-2.5">{title}</span>
          <h1 className="block text-2xl mb-0 text-primary">{value}GB/day</h1>
        </div>
        <ChangeIndicator isIncrease={isIncrease} change={change} />
      </Card.Body>
    </Card>
  );
};
