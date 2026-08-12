import { translate } from '@/i18n';

// Single source for provider support-user roles: drives both the role select
// (SupportUserDialog) and the role badge (ProviderTeamList).
const PROVIDER_ROLES: Array<{
  value: string;
  label: string;
  variant: string;
}> = [
  { value: 'agent', label: translate('Agent'), variant: 'secondary' },
  { value: 'manager', label: translate('Manager'), variant: 'info' },
];

export const PROVIDER_ROLE_OPTIONS = PROVIDER_ROLES.map(({ value, label }) => ({
  value,
  label,
}));

export const PROVIDER_ROLE_META: Record<
  string,
  { variant: string; label: string }
> = Object.fromEntries(
  PROVIDER_ROLES.map(({ value, label, variant }) => [
    value,
    { variant, label },
  ]),
);
