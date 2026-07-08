import { ENV } from '@/core/config';

// Core attributes always enabled
const CORE_PROFILE_ATTRIBUTES = [
  'username',
  'email',
  'first_name',
  'last_name',
  'full_name',
] as const;

// Configurable attributes (type-only, not used at runtime).
// Mirrors ALL_PROFILE_ATTRIBUTES in waldur-mastermind
// (waldur_core/core/user_attributes.py).
// Exception: `native_name` is frontend-only — it is gated via
// isProfileAttributeEnabled() by several UI components but is absent from the
// backend ALL_PROFILE_ATTRIBUTES / USER_ATTRIBUTE_CHOICES lists.
type ConfigurableProfileAttribute =
  | 'native_name'
  | 'phone_number'
  | 'organization'
  | 'job_title'
  | 'affiliations'
  | 'gender'
  | 'personal_title'
  | 'birth_date'
  | 'place_of_birth'
  | 'address'
  | 'country_of_residence'
  | 'nationality'
  | 'nationalities'
  | 'organization_country'
  | 'organization_type'
  | 'organization_registry_code'
  | 'organization_vat_code'
  | 'organization_address'
  | 'eduperson_assurance'
  | 'civil_number'
  | 'identity_source'
  | 'active_isds'
  | 'uid_number'
  | 'primary_gid';

export type ProfileAttribute =
  (typeof CORE_PROFILE_ATTRIBUTES)[number] | ConfigurableProfileAttribute;

export const isProfileAttributeEnabled = (
  attribute: ProfileAttribute,
): boolean => {
  if (
    (CORE_PROFILE_ATTRIBUTES as readonly string[]).includes(attribute as string)
  ) {
    return true;
  }
  const enabled =
    ENV.plugins?.WALDUR_CORE?.ENABLED_USER_PROFILE_ATTRIBUTES ?? [];

  return enabled.includes(attribute);
};
