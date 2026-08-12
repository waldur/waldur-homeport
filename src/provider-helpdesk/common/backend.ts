import { BackendTypeEnum, ProviderHelpdesk } from 'waldur-js-client';

import { translate } from '@/i18n';

// Single source of truth for helpdesk backend types: the human labels shown in
// the settings form and the helpdesk view, plus the settings key each backend
// stores its API URL under (basic/email have none).
const BACKEND_TYPE_LABELS: Record<BackendTypeEnum, string> = {
  basic: translate('Waldur (built-in)'),
  email: translate('Email'),
  atlassian: translate('Atlassian Service Desk'),
  zammad: translate('Zammad'),
  smax: translate('SMAX'),
};

export const BACKEND_OPTIONS = (
  Object.keys(BACKEND_TYPE_LABELS) as BackendTypeEnum[]
).map((value) => ({ value, label: BACKEND_TYPE_LABELS[value] }));

export const getBackendLabel = (type?: BackendTypeEnum | string): string =>
  (type && BACKEND_TYPE_LABELS[type as BackendTypeEnum]) || type || '';

// A provider's settings dict overrides the operator's global backend config;
// when set there, the API server URL lives under the backend-specific key.
const URL_SETTING_KEY: Partial<Record<BackendTypeEnum, string>> = {
  atlassian: 'ATLASSIAN_API_URL',
  zammad: 'ZAMMAD_API_URL',
  smax: 'SMAX_API_URL',
};

const HELPDESK_HEALTH_META: Record<string, { variant: string; label: string }> =
  {
    healthy: { variant: 'success', label: translate('Healthy') },
    degraded: { variant: 'warning', label: translate('Degraded') },
    unhealthy: { variant: 'danger', label: translate('Unhealthy') },
    unreachable: { variant: 'danger', label: translate('Unreachable') },
    inactive: { variant: 'secondary', label: translate('Inactive') },
  };

export const getHealthMeta = (status?: string) =>
  (status && HELPDESK_HEALTH_META[status]) || {
    variant: 'secondary',
    label: translate('Unknown'),
  };

export const getHelpdeskUrl = (helpdesk?: ProviderHelpdesk): string | null => {
  const key = helpdesk?.backend_type && URL_SETTING_KEY[helpdesk.backend_type];
  if (!key) {
    return null;
  }
  const settings = (helpdesk!.settings ?? {}) as Record<string, unknown>;
  const url = settings[key];
  return typeof url === 'string' && url ? url : null;
};
