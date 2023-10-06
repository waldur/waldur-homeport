import { pick } from '@waldur/core/utils';

export const pickOverview = pick([
  'name',
  'description',
  'full_description',
  'privacy_policy_link',
  'terms_of_service',
  'terms_of_service_link',
  'access_url',
]);
