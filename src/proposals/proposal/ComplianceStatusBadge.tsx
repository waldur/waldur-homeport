import { FC } from 'react';
import { Badge } from 'react-bootstrap';

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
    return <Badge bg="secondary">{translate('N/A')}</Badge>;
  }

  if (status.requires_review) {
    return (
      <Badge bg="warning" text="dark">
        {translate('Needs review')}
      </Badge>
    );
  }

  if (status.is_completed) {
    return <Badge bg="success">{translate('OK')}</Badge>;
  }

  // Incomplete but doesn't require review
  const percentage = status.completion_percentage || 0;
  return (
    <Badge bg="info" text="dark">
      {translate('{percentage}% complete', { percentage })}
    </Badge>
  );
};
