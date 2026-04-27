import { FC } from 'react';
import { Card, Stack } from 'react-bootstrap';

import { ChangesAmountBadge } from '@/marketplace/service-providers/dashboard/ChangesAmountBadge';

interface StatWidgetCardProps {
  label: string;
  value: string;
  changes: number;
}

export const StatWidgetCard: FC<StatWidgetCardProps> = ({
  label,
  value,
  changes,
}) => {
  return (
    <Card className="card-bordered h-100">
      <Card.Body className="py-6">
        <div className="fs-6 text-muted fw-bold mb-1">{label}</div>
        <Stack
          direction="horizontal"
          gap={2}
          className="justify-content-between"
        >
          <div className="display-6 fw-boldest">{value}</div>
          <ChangesAmountBadge
            changes={changes}
            showOnInfinity
            fractionDigits={0}
            badgeOutline
            badgePill
          />
        </Stack>
      </Card.Body>
    </Card>
  );
};
