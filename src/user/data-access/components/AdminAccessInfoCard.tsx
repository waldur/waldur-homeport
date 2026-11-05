import { ShieldCheckIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Card, CardContent } from 'waldur-ui';

import { translate } from '@/i18n';

interface AdminAccessInfoCardProps {
  description: string;
}

export const AdminAccessInfoCard: FC<AdminAccessInfoCardProps> = ({
  description,
}) => (
  <Card bordered className="mb-3">
    <CardContent>
      <div className="flex items-center gap-2.5">
        <ShieldCheckIcon size={32} weight="duotone" className="text-brand" />
        <div>
          <h5 className="mb-1">{translate('Administrative staff')}</h5>
          <p className="text-quaternary mb-0 text-xs">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
