import { client as _heyApiClient } from 'waldur-js-client/client.gen';

import { pick } from '@waldur/core/utils';

export const pickOverview = pick([
  'name',
  'description',
  'full_description',
  'privacy_policy_link',
  'access_url',
]);
