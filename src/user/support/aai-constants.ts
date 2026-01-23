import { translate } from '@waldur/i18n';

// ISO 5218 Gender codes - use functions to defer translation
export const getGenderChoices = () => [
  { value: 0, label: translate('Not known') },
  { value: 1, label: translate('Male') },
  { value: 2, label: translate('Female') },
  { value: 9, label: translate('Not applicable') },
];

// Personal title options
export const getPersonalTitleOptions = () => [
  { value: 'Mr', label: translate('Mr') },
  { value: 'Ms', label: translate('Ms') },
  { value: 'Mrs', label: translate('Mrs') },
  { value: 'Miss', label: translate('Miss') },
  { value: 'Dr', label: translate('Dr') },
  { value: 'Prof', label: translate('Prof') },
  { value: 'Sir', label: translate('Sir') },
  { value: 'Dame', label: translate('Dame') },
];

// SCHAC organization types
export const getOrganizationTypeOptions = () => [
  {
    value: 'urn:schac:homeOrganizationType:int:university',
    label: translate('University'),
  },
  {
    value: 'urn:schac:homeOrganizationType:int:research-institution',
    label: translate('Research Institution'),
  },
  {
    value: 'urn:schac:homeOrganizationType:int:company',
    label: translate('Company'),
  },
  {
    value: 'urn:schac:homeOrganizationType:int:government',
    label: translate('Government'),
  },
  {
    value: 'urn:schac:homeOrganizationType:int:nren',
    label: translate('NREN'),
  },
  {
    value: 'urn:schac:homeOrganizationType:int:other',
    label: translate('Other'),
  },
];

// Helper functions
export const formatGender = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const choices = getGenderChoices();
  return choices.find((c) => c.value === value)?.label || '';
};

export const formatOrganizationType = (
  urn: string | null | undefined,
): string => {
  if (!urn) return '';
  const options = getOrganizationTypeOptions();
  return options.find((o) => o.value === urn)?.label || urn;
};

// Known assurance URI to human-friendly label mapping
const ASSURANCE_LABELS: Record<string, string> = {
  'https://refeds.org/assurance/IAP/low': 'IAP Low',
  'https://refeds.org/assurance/IAP/medium': 'IAP Medium',
  'https://refeds.org/assurance/IAP/high': 'IAP High',
  'https://refeds.org/assurance/IAP/local-enterprise': 'IAP Local Enterprise',
  'https://refeds.org/assurance/ID/unique': 'ID Unique',
  'https://refeds.org/assurance/ID/eppn-unique-no-reassign': 'EPPN Unique',
  'https://refeds.org/assurance/ID/eppn-unique-reassign-1y':
    'EPPN Unique (1yr)',
  'https://refeds.org/assurance/ATP/ePA-1m': 'ATP Monthly',
  'https://refeds.org/assurance/ATP/ePA-1d': 'ATP Daily',
  'https://refeds.org/assurance/profile/cappuccino': 'Cappuccino',
  'https://refeds.org/assurance/profile/espresso': 'Espresso',
};

// Helper to format REFEDS assurance URIs with human-friendly labels
export const formatAssuranceUri = (uri: string): string => {
  if (!uri) return '';

  // Check if we have a known label for this URI
  if (ASSURANCE_LABELS[uri]) {
    return ASSURANCE_LABELS[uri];
  }

  // Try to extract the meaningful part from REFEDS URIs
  // e.g., "https://refeds.org/assurance/IAP/low" -> "IAP/low"
  try {
    const url = new URL(uri);
    const path = url.pathname.replace('/assurance/', '').replace(/^\//, '');
    return path || uri;
  } catch {
    // If not a valid URL, just return as-is
    return uri;
  }
};
