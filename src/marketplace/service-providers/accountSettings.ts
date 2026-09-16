import { AccountScope, UsernameGenerationPolicyEnum } from 'waldur-js-client';

import { translate } from '@/i18n';

interface Option<T> {
  label: string;
  value: T;
}

export const USERNAME_GENERATION_POLICY_OPTIONS: Option<UsernameGenerationPolicyEnum>[] =
  [
    {
      label: translate('Service provider'),
      value: 'service_provider',
    },
    {
      label: translate('Anonymized'),
      value: 'anonymized',
    },
    {
      label: translate('Full name'),
      value: 'full_name',
    },
    {
      label: translate('Waldur username'),
      value: 'waldur_username',
    },
    {
      label: translate('FreeIPA'),
      value: 'freeipa',
    },
    {
      label: translate('Identity claim'),
      value: 'identity_claim',
    },
  ];

export const ACCOUNT_SCOPE_OPTIONS: Option<AccountScope>[] = [
  {
    label: translate('Per offering'),
    value: 'offering',
  },
  {
    label: translate('Per service provider'),
    value: 'provider',
  },
];

// What the backend falls back to when neither the offering nor its service
// provider sets a value.
export const DEFAULT_ACCOUNT_SCOPE: AccountScope = 'offering';
export const DEFAULT_USERNAME_GENERATION_POLICY: UsernameGenerationPolicyEnum =
  'service_provider';
export const DEFAULT_ANONYMIZED_PREFIX = 'waldur_';
export const DEFAULT_HOMEDIR_PREFIX = '/home/';
export const DEFAULT_LOGIN_SHELL = '/bin/bash';

export const getOptionLabel = <T>(options: Option<T>[], value: T) =>
  options.find((option) => option.value === value)?.label;
