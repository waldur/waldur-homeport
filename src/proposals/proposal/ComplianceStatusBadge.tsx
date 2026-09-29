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

const getVariant = (status: ComplianceStatus | null) => {
  if (!status?.has_checklist) {
    return 'neutral';
  }
  if (status.requires_review) {
    return 'warning';
  }
  if (status.is_completed) {
    return 'success';
  }
  return 'purple';
};

// Shared with the table export, so the file reads like the badge.
export const formatComplianceStatus = (
  status: ComplianceStatus | null,
): string => {
  if (!status?.has_checklist) {
    return translate('N/A');
  }
  if (status.requires_review) {
    return translate('Needs review');
  }
  if (status.is_completed) {
    return translate('OK');
  }
  // Incomplete but doesn't require review
  return translate('{percentage}% complete', {
    percentage: status.completion_percentage || 0,
  });
};

export const ComplianceStatusBadge: FC<ComplianceStatusBadgeProps> = ({
  status,
}) => (
  <Badge variant={getVariant(status)} shape="pill" tone="outline">
    {formatComplianceStatus(status)}
  </Badge>
);
