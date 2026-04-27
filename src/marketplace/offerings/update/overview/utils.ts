import { pick } from '@/core/utils';

export const pickOverview = pick([
  'name',
  'description',
  'full_description',
  'privacy_policy_link',
  'access_url',
  'documentation_url',
  'helpdesk_url',
]);
