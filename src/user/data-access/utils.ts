import { translate } from '@waldur/i18n';

import { AccessorType, AccessType } from './types';

// Format field names for display (e.g., "full_name" -> "Full name")
export const formatFieldName = (field: string): string => {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Format access type for badges
export const formatAccessType = (accessType: AccessType): string => {
  const labels: Record<AccessType, string> = {
    staff: translate('Staff'),
    support: translate('Support'),
    staff_and_support: translate('Staff & Support'),
  };
  return labels[accessType] || accessType;
};

// Get badge variant based on access type
export const getAccessTypeBadgeVariant = (
  accessType: AccessType,
): 'danger' | 'warning' | 'default' => {
  const variants: Record<AccessType, 'danger' | 'warning' | 'default'> = {
    staff: 'danger',
    support: 'warning',
    staff_and_support: 'danger',
  };
  return variants[accessType] || 'default';
};

// Map accessor type to anonymized category label
export const getAccessorCategory = (accessorType: AccessorType): string => {
  const categories: Record<AccessorType, string> = {
    staff: translate('Platform administrator'),
    support: translate('Platform support staff'),
    organization_member: translate('User in your organization'),
    service_provider: translate('Service provider'),
    self: translate('You'),
  };
  return categories[accessorType] || translate('Unknown');
};

// Get badge variant for accessor type
export const getAccessorTypeBadgeVariant = (
  accessorType: AccessorType,
): 'danger' | 'warning' | 'info' | 'secondary' | 'success' => {
  const variants: Record<
    AccessorType,
    'danger' | 'warning' | 'info' | 'secondary' | 'success'
  > = {
    staff: 'danger',
    support: 'warning',
    organization_member: 'info',
    service_provider: 'secondary',
    self: 'success',
  };
  return variants[accessorType] || 'secondary';
};
