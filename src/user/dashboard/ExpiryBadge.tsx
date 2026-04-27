import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';

interface ExpiryBadgeProps {
  expires: string;
}

export const ExpiryBadge: FC<ExpiryBadgeProps> = ({ expires }) => {
  const now = new Date();
  const expiryDate = new Date(expires);
  const diffMs = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <Badge variant="danger" size="sm" pill outline>
        {translate('Expired')}
      </Badge>
    );
  } else if (diffDays === 0) {
    return (
      <Badge variant="danger" size="sm" pill outline>
        {translate('Expires today')}
      </Badge>
    );
  } else if (diffDays <= 3) {
    return (
      <Badge variant="warning" size="sm" pill outline>
        {diffDays === 1
          ? translate('Expires tomorrow')
          : translate('Expires in {count} days', { count: diffDays })}
      </Badge>
    );
  } else {
    return (
      <Badge variant="secondary" size="sm" pill outline>
        {translate('Expires {date}', { date: formatDate(expires) })}
      </Badge>
    );
  }
};
