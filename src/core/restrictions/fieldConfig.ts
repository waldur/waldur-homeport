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
};
