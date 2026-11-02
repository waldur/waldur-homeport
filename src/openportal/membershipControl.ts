import type { MembershipControlEnum } from 'waldur-js-client';

import { translate } from '@/i18n';

/**
 * How each membership control reads. Keyed by the API enum, so a control the
 * backend adds does not compile until it has a label here.
 */
export const getMembershipControlLabels = (): Record<
  MembershipControlEnum,
  string
> => ({
  open: translate('Open'),
  members_only: translate('Members only'),
  roles_only: translate('Roles only'),
  locked: translate('Locked'),
});
