import { FC } from 'react';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

interface ComplianceStatus {
  has_checklist: boolean;
  is_completed?: boolean;
  requires_review?: boolean;
  completion_percentage?: number;
}

interface ComplianceStatusBadgeProps {
  status: ComplianceStatus | null;
}

export const ComplianceStatusBadge: FC<ComplianceStatusBadgeProps> = ({
  status,
}) => {
  if (!status?.has_checklist) {
    return (
      <Badge variant="default" pill outline>
        {translate('N/A')}
      </Badge>
    );
  }

  if (status.requires_review) {
    return (
      <Badge variant="warning" pill outline>
        {translate('Needs review')}
      </Badge>
    );
  }

  if (status.is_completed) {
    return (
      <Badge variant="success" pill outline>
        {translate('OK')}
      </Badge>
    );
  }

  // Incomplete but doesn't require review
  const percentage = status.completion_percentage || 0;
  return (
    <Badge variant="purple" pill outline>
      {translate('{percentage}% complete', { percentage })}
    </Badge>
  );
};
