import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';

interface DueDateBadgeProps {
  dueDate: string;
}

export const DueDateBadge: FC<DueDateBadgeProps> = ({ dueDate }) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Overdue
    const overdueDays = Math.abs(diffDays);
    return (
      <Badge variant="danger" size="sm" pill outline>
        {overdueDays === 1
          ? translate('1 day overdue')
          : translate('{count} days overdue', { count: overdueDays })}
      </Badge>
    );
  } else if (diffDays === 0) {
    return (
      <Badge variant="warning" size="sm" pill outline>
        {translate('Due today')}
      </Badge>
    );
  } else if (diffDays <= 7) {
    return (
      <Badge variant="warning" size="sm" pill outline>
        {diffDays === 1
          ? translate('Due tomorrow')
          : translate('Due in {count} days', { count: diffDays })}
      </Badge>
    );
  } else {
    return (
      <Badge variant="secondary" size="sm" pill outline>
        {formatDate(dueDate)}
      </Badge>
    );
  }
};
