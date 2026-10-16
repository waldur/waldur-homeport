import { ShieldCheckIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@/i18n';

interface AdminAccessInfoCardProps {
  description: string;
}

export const AdminAccessInfoCard: FC<AdminAccessInfoCardProps> = ({
  description,
}) => (
  <Card className="card-bordered mb-4">
    <Card.Body>
      <div className="flex items-center gap-3">
        <ShieldCheckIcon size={32} weight="duotone" className="text-brand" />
        <div>
          <h5 className="mb-1">{translate('Administrative staff')}</h5>
          <p className="text-quaternary mb-0 text-xs">{description}</p>
        </div>
      </div>
    </Card.Body>
  </Card>
);
