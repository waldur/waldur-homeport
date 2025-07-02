import { ArrowDownIcon, ArrowUpIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Badge } from '@waldur/core/Badge';

interface NetworkStatisticsCardProps {
  title: string;
  value: number;
  change: number;
  isIncrease: boolean;
}

const ChangeIndicator = ({ isIncrease, change }) => {
  return isIncrease ? (
    <Badge variant="success" outline pill>
      <ArrowUpIcon />
      {change}%
    </Badge>
  ) : (
    <Badge variant="danger" outline pill>
      <ArrowDownIcon />
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
    <Card className="card-bordered mb-5">
      <Card.Body className="d-flex justify-content-between align-items-end gap-2">
        <div>
          <span className="d-block text-muted mb-3">{title}</span>
          <h1 className="d-block fs-1x mb-0 text-dark">{value}GB/day</h1>
        </div>
        <ChangeIndicator isIncrease={isIncrease} change={change} />
      </Card.Body>
    </Card>
  );
};
