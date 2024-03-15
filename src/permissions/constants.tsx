import { translate } from '@waldur/i18n';

import { RoleType } from './types';

export const ROLE_TYPES = [
  { value: 'customer', label: translate('Organization') },
  { value: 'project', label: translate('Project') },
  { value: 'offering', label: translate('Offering') },
  { value: 'call', label: translate('Call') },
  { value: 'proposal', label: translate('Proposal') },
] as { value: RoleType; label: string }[];
