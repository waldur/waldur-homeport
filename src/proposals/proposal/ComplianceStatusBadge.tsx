import { FC } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

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
      <Badge variant="neutral" shape="pill" tone="outline">
        {translate('N/A')}
      </Badge>
    );
  }

  if (status.requires_review) {
    return (
      <Badge variant="warning" shape="pill" tone="outline">
        {translate('Needs review')}
      </Badge>
    );
  }

  if (status.is_completed) {
    return (
      <Badge variant="success" shape="pill" tone="outline">
        {translate('OK')}
      </Badge>
    );
  }

  // Incomplete but doesn't require review
  const percentage = status.completion_percentage || 0;
  return (
    <Badge variant="purple" shape="pill" tone="outline">
      {translate('{percentage}% complete', { percentage })}
    </Badge>
  );
};
