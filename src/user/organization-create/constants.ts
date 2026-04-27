import { translate } from '@/i18n';

type AuthMethodInfo = {
  title: string;
  description: string;
  note?: string;
};

const DEFAULT_AUTH_METHOD_INFO: AuthMethodInfo = {
  title: translate('Personal identification required'),
  description: translate(
    'To verify your right to represent a company, we need to confirm your identity. This helps us ensure secure business registration.',
  ),
  note: translate(
    'Your details help us confirm your authorization to represent the organization.',
  ),
};

const AUTH_METHOD_INFO: Record<string, AuthMethodInfo> = {
  ariregister: {
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
  wirtschaftscompass: {
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
  manual: {
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
};

type ValidationMethodInfo = {
  title: string;
  description: string;
};

const DEFAULT_VALIDATION_METHOD_INFO: ValidationMethodInfo = {
  title: translate('Next step: Personal identification'),
  description: translate(
    'Your company can be automatically verified by matching your personal details with official business registry information. This makes the process faster and more secure.',
  ),
};

const VALIDATION_METHOD_INFO: Record<string, ValidationMethodInfo> = {
  ariregister: {
    title: translate('Next step: Personal identification'),
    description: translate(
      'Estonian companies can be automatically verified by matching your personal ID with Äriregister data, making the process faster and more secure. To verify your right to represent a company automatically via Äriregister, we need your identity through the national authentication service (TARA) and the official registry code of the company.',
    ),
  },
  wirtschaftscompass: {
    title: translate('Next step: Personal identification'),
    description: translate(
      'Austrian companies can be automatically verified by matching your personal ID with WirtschaftsCompass. To verify your right to represent a company in Austria, we need to confirm your identity by matching your personal details with official business registry information. Please provide your first name, last name, and date of birth, which will be used for this verification.',
    ),
  },
  manual: {
    title: translate(
      'Identity verification is required for business registration',
    ),
    description: translate(
      'Your organization details will be manually reviewed by our team. You can provide supporting documents to speed up the process.',
    ),
  },
};

export const getValidationMethodInfo = (
  validationMethod: string,
): ValidationMethodInfo => {
  return (
    VALIDATION_METHOD_INFO[validationMethod] || DEFAULT_VALIDATION_METHOD_INFO
  );
};

export const getAuthMethodInfo = (validationMethod: string): AuthMethodInfo => {
  return AUTH_METHOD_INFO[validationMethod] || DEFAULT_AUTH_METHOD_INFO;
};
