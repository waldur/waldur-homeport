import { translate } from '@/i18n';

export const ENTRY_TYPE_CONFIG = {
  breaking: {
    label: () => translate('Breaking'),
    variant: 'danger' as const,
    icon: 'WarningCircle',
  },
  security: {
    label: () => translate('Security'),
    variant: 'danger' as const,
    icon: 'ShieldWarning',
  },
  deprecation: {
    label: () => translate('Deprecation'),
    variant: 'warning' as const,
    icon: 'Clock',
  },
  feature: {
    label: () => translate('Feature'),
    variant: 'success' as const,
    icon: 'Plus',
  },
  improvement: {
    label: () => translate('Improvement'),
    variant: 'info' as const,
    icon: 'ArrowUp',
  },
  fix: {
    label: () => translate('Fix'),
    variant: 'neutral' as const,
    icon: 'Wrench',
  },
};

export const RISK_CONFIG = {
  high: { label: () => translate('High'), variant: 'danger' as const },
  medium: { label: () => translate('Medium'), variant: 'warning' as const },
  low: { label: () => translate('Low'), variant: 'info' as const },
  none: { label: () => translate('None'), variant: 'neutral' as const },
};

export const URGENCY_CONFIG = {
  critical: {
    label: () => translate('Critical'),
    variant: 'danger' as const,
  },
  high: {
    label: () => translate('High'),
    variant: 'warning' as const,
  },
  moderate: {
    label: () => translate('Moderate'),
    variant: 'info' as const,
  },
  low: {
    label: () => translate('Low'),
    variant: 'neutral' as const,
  },
};
