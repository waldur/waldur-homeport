import { User } from 'waldur-js-client';

import { translate } from '@/i18n';

import {
  formatAssuranceUri,
  formatGender,
  formatOrganizationType,
} from './aai-constants';
import { ProfileAttribute } from './profileAttributes';

export interface ExtraProfileField {
  attr: ProfileAttribute;
  label: () => string;
  getValue: (user: User) => string | null;
  // Hide the row entirely when empty (used for list-valued attributes,
  // mirroring how `affiliations` is rendered in UserDetailsTable).
  skipWhenEmpty?: boolean;
}

// Profile attributes rendered in UserDetailsTable only when enabled in the
// deployment (ENABLED_USER_PROFILE_ATTRIBUTES). Scalar attributes reuse
// FieldWithCopy, so an empty value renders as a dash, consistent with the rest
// of the table; list-valued attributes set skipWhenEmpty to hide the row.
export const EXTRA_PROFILE_FIELDS: ReadonlyArray<ExtraProfileField> = [
  {
    attr: 'personal_title',
    label: () => translate('Personal title'),
    getValue: (user) => user.personal_title || null,
  },
  {
    attr: 'gender',
    label: () => translate('Gender'),
    getValue: (user) => formatGender(user.gender) || null,
  },
  {
    attr: 'place_of_birth',
    label: () => translate('Place of birth'),
    getValue: (user) => user.place_of_birth || null,
  },
  {
    attr: 'country_of_residence',
    label: () => translate('Country of residence'),
    getValue: (user) => user.country_of_residence || null,
  },
  {
    attr: 'nationality',
    label: () => translate('Nationality'),
    getValue: (user) => user.nationality || null,
  },
  {
    attr: 'nationalities',
    label: () => translate('Nationalities'),
    skipWhenEmpty: true,
    getValue: (user) =>
      Array.isArray(user.nationalities) && user.nationalities.length > 0
        ? user.nationalities.join(', ')
        : null,
  },
  {
    attr: 'organization_country',
    label: () => translate('Organization country'),
    getValue: (user) => user.organization_country || null,
  },
  {
    attr: 'organization_type',
    label: () => translate('Organization type'),
    getValue: (user) => formatOrganizationType(user.organization_type) || null,
  },
  {
    attr: 'organization_registry_code',
    label: () => translate('Organization registry code'),
    getValue: (user) => user.organization_registry_code || null,
  },
  {
    attr: 'eduperson_assurance',
    label: () => translate('Eduperson assurance'),
    skipWhenEmpty: true,
    getValue: (user) =>
      Array.isArray(user.eduperson_assurance) &&
      user.eduperson_assurance.length > 0
        ? user.eduperson_assurance.map(formatAssuranceUri).join(', ')
        : null,
  },
];
