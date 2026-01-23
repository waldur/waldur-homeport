import { translate } from '@waldur/i18n';

import { RestrictionField } from './types';

export const fieldConfig: Record<
  RestrictionField,
  { title: string; label: string; placeholder: string; description: string }
> = {
  user_email_patterns: {
    title: translate('Edit email patterns'),
    label: translate('Email patterns'),
    placeholder: translate('Enter email patterns separated by commas'),
    description: translate(
      'Users whose email matches any of these regex patterns will be allowed (e.g., .*@example\\.com).',
    ),
  },
  user_affiliations: {
    title: translate('Edit user affiliations'),
    label: translate('User affiliations'),
    placeholder: translate('e.g., student, faculty, staff, researcher'),
    description: translate(
      'Users with any of these affiliations will be allowed.',
    ),
  },
  user_identity_sources: {
    title: translate('Edit identity sources'),
    label: translate('Identity sources'),
    placeholder: translate('e.g., tara, eduteams, myscience'),
    description: translate(
      'Users who authenticated using any of these identity providers will be allowed.',
    ),
  },
  user_nationalities: {
    title: translate('Edit nationalities'),
    label: translate('Nationalities'),
    placeholder: translate('e.g., DE, FR, US (ISO 3166-1 alpha-2 codes)'),
    description: translate(
      'Users with any of these nationalities will be allowed.',
    ),
  },
  user_organization_types: {
    title: translate('Edit organization types'),
    label: translate('Organization types'),
    placeholder: translate(
      'e.g., urn:schac:homeOrganizationType:int:university',
    ),
    description: translate(
      'Users whose organization type matches any of these SCHAC URNs will be allowed.',
    ),
  },
  user_assurance_levels: {
    title: translate('Edit assurance levels'),
    label: translate('Assurance levels'),
    placeholder: translate('e.g., https://refeds.org/assurance/IAP/medium'),
    description: translate(
      'Users must have ALL of these assurance levels to be allowed.',
    ),
  },
};
