import { translate } from '@/i18n';

interface AuthMethodInfo {
  title: string;
  description: string;
  note?: string;
}

interface ValidationMethodInfo {
  title: string;
  description: string;
}

interface OnboardingMethod {
  value: string;
  label: string;
  auth: AuthMethodInfo;
  validation: ValidationMethodInfo;
}

const DEFAULT_AUTH_METHOD_INFO: AuthMethodInfo = {
  title: translate('Personal identification required'),
  description: translate(
    'To verify your right to represent a company, we need to confirm your identity. This helps us ensure secure business registration.',
  ),
  note: translate(
    'Your details help us confirm your authorization to represent the organization.',
  ),
};

const DEFAULT_VALIDATION_METHOD_INFO: ValidationMethodInfo = {
  title: translate('Next step: Personal identification'),
  description: translate(
    'Your company can be automatically verified by matching your personal details with official business registry information. This makes the process faster and more secure.',
  ),
};

// Single source of truth for onboarding validation methods. The array order is
// the canonical display order: official register first, then its D&B equivalent,
// grouped by country, with manual always last.
const ONBOARDING_METHODS: OnboardingMethod[] = [
  {
    value: 'ariregister',
    label: translate('Estonian Business Register (Äriregister)'),
    auth: {
      title: translate(
        'Estonian identity code required for business registration',
      ),
      description: translate(
        'To verify your right to represent a company in Estonia, we need to confirm your identity through the national authentication service (TARA).',
      ),
      note: translate(
        'Secure authentication through Estonian ID-card, Mobile-ID, Smart-ID.',
      ),
    },
    validation: {
      title: translate('Next step: Personal identification'),
      description: translate(
        'Estonian companies can be automatically verified by matching your personal ID with Äriregister data, making the process faster and more secure. To verify your right to represent a company automatically via Äriregister, we need your identity through the national authentication service (TARA) and the official registry code of the company.',
      ),
    },
  },
  {
    value: 'wirtschaftscompass',
    label: translate('Austrian Business Register (WirtschaftsCompass)'),
    auth: {
      title: translate(
        'Personal details required for business registration in Austria',
      ),
      description: translate(
        'To verify your right to represent a company in Austria, we need to confirm your identity by matching your personal details with official business registry information. Please provide your first name, last name, and date of birth, which will be used for this verification.',
      ),
      note: translate(
        'Secure authentication through supported Austrian eID methods.',
      ),
    },
    validation: {
      title: translate('Next step: Personal identification'),
      description: translate(
        'Austrian companies can be automatically verified by matching your personal ID with WirtschaftsCompass. To verify your right to represent a company in Austria, we need to confirm your identity by matching your personal details with official business registry information. Please provide your first name, last name, and date of birth, which will be used for this verification.',
      ),
    },
  },
  {
    value: 'bolagsverket',
    label: translate('Swedish Business Register (Bolagsverket)'),
    auth: {
      title: translate(
        'Personnummer required for Swedish business registration',
      ),
      description: translate(
        'Your personnummer is matched against the board-member roster Bolagsverket maintains for the company.',
      ),
      note: translate('Used only for this verification.'),
    },
    validation: {
      title: translate('Next step: Personal identification'),
      description: translate(
        "Swedish companies can be automatically verified by matching your personal ID (personnummer) against Bolagsverket records. To verify your right to represent the company, we need your personnummer and the company's organization number.",
      ),
    },
  },
  {
    value: 'dnb_se',
    label: translate('Dun & Bradstreet Sweden'),
    auth: {
      title: translate('Personnummer required for D&B Sweden lookup'),
      description: translate(
        "Your personnummer is checked against the company's signatories in Dun & Bradstreet's Nordic Right to Sign service.",
      ),
      note: translate('Used only for this verification.'),
    },
    validation: {
      title: translate('Next step: Personal identification'),
      description: translate(
        "Verify Swedish companies via Dun & Bradstreet's Nordic Right to Sign service by checking your personnummer against the company's listed signatories.",
      ),
    },
  },
  {
    value: 'dnb_no',
    label: translate('Dun & Bradstreet Norway'),
    auth: {
      title: translate('Personal details required for D&B Norway lookup'),
      description: translate(
        "Your first name, last name and date of birth are checked against the company's signatories in Dun & Bradstreet's Nordic Right to Sign service.",
      ),
      note: translate('Used only for this verification.'),
    },
    validation: {
      title: translate('Next step: Personal identification'),
      description: translate(
        "Verify Norwegian companies via Dun & Bradstreet's Nordic Right to Sign service by checking your name and date of birth against the company's listed signatories.",
      ),
    },
  },
  {
    value: 'dnb_dk',
    label: translate('Dun & Bradstreet Denmark'),
    auth: {
      title: translate('Personal details required for D&B Denmark lookup'),
      description: translate(
        "Your first and last name are checked against the company's signatories in Dun & Bradstreet's Nordic Right to Sign service. If you can't be matched automatically, the request is sent for manual review.",
      ),
      note: translate('Used only for this verification.'),
    },
    validation: {
      title: translate('Next step: Personal identification'),
      description: translate(
        "Verify Danish companies via Dun & Bradstreet's Nordic Right to Sign service by checking your name against the company's listed signatories. Matches that can't be confirmed automatically are reviewed by our team.",
      ),
    },
  },
  {
    value: 'dnb_fi',
    label: translate('Dun & Bradstreet Finland'),
    auth: {
      title: translate('Personal details required for D&B Finland lookup'),
      description: translate(
        "Your first name, last name and date of birth are checked against the company's signatories in Dun & Bradstreet's Nordic Right to Sign service.",
      ),
      note: translate('Used only for this verification.'),
    },
    validation: {
      title: translate('Next step: Personal identification'),
      description: translate(
        "Verify Finnish companies via Dun & Bradstreet's Nordic Right to Sign service by checking your name and date of birth against the company's listed signatories.",
      ),
    },
  },
  {
    value: 'manual',
    label: translate('Manual verification'),
    auth: {
      title: translate(
        'Identity verification is required for business registration',
      ),
      description: translate(
        'To verify your right to represent a company, we need to confirm your identity using supported authentication methods. This helps us keep the onboarding process secure.',
      ),
      note: translate(
        'Your details help us confirm your authorization to represent the organization and make the onboarding process faster and more reliable.',
      ),
    },
    validation: {
      title: translate(
        'Identity verification is required for business registration',
      ),
      description: translate(
        'Your organization details will be manually reviewed by our team. You can provide supporting documents to speed up the process.',
      ),
    },
  },
];

const METHOD_BY_VALUE: Record<string, OnboardingMethod> = Object.fromEntries(
  ONBOARDING_METHODS.map((method) => [method.value, method]),
);

const CANONICAL_ORDER = ONBOARDING_METHODS.map((method) => method.value);

export const getValidationMethodInfo = (
  validationMethod: string,
): ValidationMethodInfo =>
  METHOD_BY_VALUE[validationMethod]?.validation ||
  DEFAULT_VALIDATION_METHOD_INFO;

export const getAuthMethodInfo = (validationMethod: string): AuthMethodInfo =>
  METHOD_BY_VALUE[validationMethod]?.auth || DEFAULT_AUTH_METHOD_INFO;

const getValidationMethodLabel = (method: string): string =>
  METHOD_BY_VALUE[method]?.label || method;

// Build the dropdown options for the portal's configured methods. Unknown
// methods (not in CANONICAL_ORDER) are kept but sorted after the known ones,
// and 'manual' is always appended last.
export const getValidationMethodOptions = (configuredMethods: string[]) => {
  const rank = (method: string) => {
    const index = CANONICAL_ORDER.indexOf(method);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  const methods = [...new Set(configuredMethods)]
    .filter((method) => method !== 'manual')
    .sort((a, b) => rank(a) - rank(b));
  return [...methods, 'manual'].map((value) => ({
    value,
    label: getValidationMethodLabel(value),
  }));
};
