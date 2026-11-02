import type { RancherNodeRoleEnum } from 'waldur-js-client';

import { translate } from '@/i18n';

/**
 * How each node role reads. Keyed by the API enum, so a role the backend adds
 * does not compile until it has a label here.
 */
export const getNodeRoleLabels = (): Record<RancherNodeRoleEnum, string> => ({
  agent: translate('Agent'),
  server: translate('Server'),
});
