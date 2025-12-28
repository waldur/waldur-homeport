import { WarningCircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Card } from 'react-bootstrap';

import { FeaturedIcon } from './FeaturedIcon';

interface WarnCardProps {
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

export const WarnCard: FC<WarnCardProps> = ({
  title,
  description,
  className,
}) => (
  <Card className={classNames('card-bordered rounded-3', className)}>
    <Card.Body className="d-flex align-items-start gap-3 p-4">
      {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
      <FeaturedIcon IconComponent={WarningCircleIcon} variant="warning" />

      <div>
        <div className="mb-1 fw-bold">{title}</div>
        <div className="text-muted">{description}</div>
      </div>
    </Card.Body>
  </Card>
);
