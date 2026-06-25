import { ENV } from '@/core/config';

// Core attributes always enabled
const CORE_PROFILE_ATTRIBUTES = [
  'username',
  'email',
  'first_name',
  'last_name',
  'full_name',
] as const;

// Configurable attributes (type-only, not used at runtime)
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
  | 'country_of_residence'
  | 'nationality'
  | 'nationalities'
  | 'organization_country'
  | 'organization_type'
  | 'organization_registry_code'
  | 'organization_vat_code'
  | 'eduperson_assurance'
  | 'civil_number'
  | 'identity_source';

export type ProfileAttribute =
  | (typeof CORE_PROFILE_ATTRIBUTES)[number]
  | ConfigurableProfileAttribute;

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
