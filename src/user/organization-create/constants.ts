import { translate } from '@waldur/i18n';

enum CountryCode {
  Estonia = 'EE',
  Austria = 'AT',
}

type OnboardingCopy = {
  title: string;
  description: string;
  reason: string;
  authMethodsNote: string;
};

const ONBOARDING_COUNTRY_COPY: Record<CountryCode, OnboardingCopy> = {
  [CountryCode.Estonia]: {
    title: translate(
      'Estonian identity code required for business registration',
    ),
    description: translate(
      'To verify your right to represent a company in Estonia, we need to confirm your identity through the national authentication service (TARA). Your personal ID code will be securely retrieved from the Estonian Business Register (Äriregister).',
    ),
    reason: translate(
      'Estonian companies can be automatically verified by matching your personal ID with Äriregister data, making the process faster and more secure.',
    ),
    authMethodsNote: translate(
      'Secure authentication through Estonian ID-card, Mobile-ID, Smart-ID.',
    ),
  },
  [CountryCode.Austria]: {
    title: translate(
      'Personal details required for business registration in Austria',
    ),
    description: translate(
      'To verify your right to represent a company in Austria, we need to confirm your identity by matching your personal details with official business registry information. Please provide your first name, last name, and date of birth, which will be used for this verification.',
    ),
    reason: translate(
      'Austrian companies can be automatically verified by matching your personal details with data from the Austrian Business Register (WirtschaftsCompass). This allows us to confirm your authorization to represent the organization and helps make the onboarding process faster and more reliable.',
    ),
    authMethodsNote: translate(
      'Secure authentication through supported Austrian eID methods.',
    ),
  },
};

const DEFAULT_COPY: OnboardingCopy = {
  title: translate(
    'Identity verification is required for business registration',
  ),
  description: translate(
    'To verify your right to represent a company, we need to confirm your identity using supported authentication methods. This helps us keep the onboarding process secure.',
  ),
  reason: translate(
    'Your details help us confirm your authorization to represent the organization and make the onboarding process faster and more reliable.',
  ),
  authMethodsNote: translate(
    'Secure authentication through supported identity methods.',
  ),
};

export const getOnboardingCopy = (country?: string): OnboardingCopy => {
  const copy = ONBOARDING_COUNTRY_COPY[country as CountryCode] || DEFAULT_COPY;

  return {
    title: copy.title,
    description: copy.description,
    reason: copy.reason,
    authMethodsNote: copy.authMethodsNote,
  };
};
