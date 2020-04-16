import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { listToDict } from '../core/utils';

const quotaNames = {
  storage: 'disk',
  vcpu: 'cores',
};

const parseQuotaName = name => quotaNames[name] || name;

export const parseQuotas = listToDict(
  item => parseQuotaName(item.name),
  item => item.limit,
);

export const parseQuotasUsage = listToDict(
  item => parseQuotaName(item.name),
  item => item.usage,
);

export const PRIVATE_CIDR_PATTERN = new RegExp(
  // Class A
  '(^(10)(.([2]([0-5][0-5]|[01234][6-9])|[1][0-9][0-9]|[1-9][0-9]|[0-9])){2}.0/24$)' +
    // Class B
    '|(^(172).(1[6-9]|2[0-9]|3[0-1])(.(2[0-4][0-9]|25[0-5]|[1][0-9][0-9]|[1-9][0-9]|[0-9])).0/24$)' +
    // Class C
    '|(^(192).(168)(.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])).0/24$)',
);

export const validatePrivateSubnetCIDR = value => {
  if (!value) {
    return;
  }
  if (!value.match(PRIVATE_CIDR_PATTERN)) {
    return translate('Enter private IPv4 CIDR.');
  }
};

export const getTenantListState = projectId => ({
  label: translate('Private clouds'),
  state: 'marketplace-project-resources',
  params: {
    category_uuid:
      ENV.plugins.WALDUR_MARKETPLACE_OPENSTACK.TENANT_CATEGORY_UUID,
    uuid: projectId,
  },
});

export const getInstanceListState = projectId => ({
  label: translate('Virtual machines'),
  state: 'marketplace-project-resources',
  params: {
    category_uuid:
      ENV.plugins.WALDUR_MARKETPLACE_OPENSTACK.INSTANCE_CATEGORY_UUID,
    uuid: projectId,
  },
});
