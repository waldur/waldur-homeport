import { translate } from '@/i18n';

import { RoleType } from './types';

export const ROLE_TYPES = [
  { value: 'customer', label: translate('Organization') },
  { value: 'project', label: translate('Project') },
  { value: 'offering', label: translate('Offering') },
  { value: 'call', label: translate('Call') },
  { value: 'proposal', label: translate('Proposal') },
  {
    value: 'service_provider',
    label: translate('Service provider organization'),
  },
  {
    value: 'call_organizer',
    label: translate('Call managing organization'),
  },
] as { value: RoleType; label: string }[];
