import { translate } from '@waldur/i18n';
import { RoleType } from '@waldur/permissions/types';

export const ROLE_TYPES = [
  { value: 'customer', label: translate('Organization') },
  { value: 'project', label: translate('Project') },
  { value: 'offering', label: translate('Offering') },
] as { value: RoleType; label: string }[];
