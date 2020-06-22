import { get } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { ActionContext } from '@waldur/resource/actions/types';

import { listToDict } from '../core/utils';

interface ConsoleResponse {
  url: string;
}

const quotaNames = {
  storage: 'disk',
  vcpu: 'cores',
};

const parseQuotaName = (name) => quotaNames[name] || name;

export const parseQuotas = listToDict(
  (item) => parseQuotaName(item.name),
  (item) => item.limit,
);

export const parseQuotasUsage = listToDict(
  (item) => parseQuotaName(item.name),
  (item) => item.usage,
);

export const PRIVATE_CIDR_PATTERN = new RegExp(
  // Class A
  '(^(10)(.([2]([0-5][0-5]|[01234][6-9])|[1][0-9][0-9]|[1-9][0-9]|[0-9])){2}.0/24$)' +
    // Class B
    '|(^(172).(1[6-9]|2[0-9]|3[0-1])(.(2[0-4][0-9]|25[0-5]|[1][0-9][0-9]|[1-9][0-9]|[0-9])).0/24$)' +
    // Class C
    '|(^(192).(168)(.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])).0/24$)',
);

export const validatePrivateSubnetCIDR = (value) => {
  if (!value) {
    return;
  }
  if (!value.match(PRIVATE_CIDR_PATTERN)) {
    return translate('Enter private IPv4 CIDR.');
  }
};

export const getTenantListState = (projectId) => ({
  label: translate('Private clouds'),
  state: 'marketplace-project-resources',
  params: {
    category_uuid:
      ENV.plugins.WALDUR_MARKETPLACE_OPENSTACK.TENANT_CATEGORY_UUID,
    uuid: projectId,
  },
});

export const getInstanceListState = (projectId) => ({
  label: translate('Virtual machines'),
  state: 'marketplace-project-resources',
  params: {
    category_uuid:
      ENV.plugins.WALDUR_MARKETPLACE_OPENSTACK.INSTANCE_CATEGORY_UUID,
    uuid: projectId,
  },
});

const getConsoleURL = (moduleName: string, id: string) =>
  get<ConsoleResponse>(`/${moduleName}/${id}/console/`);

export const executeConsoleAction = (resource, moduleName: string) => {
  getConsoleURL(moduleName, resource.uuid)
    .then((response) => {
      window.open(response.data.url);
    })
    .catch((error) => {
      const ctx = { message: format(error) };
      const message = translate(
        'Unable to open console. Error message: {message}',
        ctx,
      );
      alert(message);
    });
};

const getConsoleOutput = (moduleName: string, id: string) =>
  get(`/${moduleName}/${id}/console_log/`);

export const executeConsoleLogAction = (resource, moduleName: string) => {
  getConsoleOutput(moduleName, resource.uuid)
    .then((response) => {
      const win = window.open();
      if (win == null) {
        alert(translate('Unable to open console log'));
        return;
      }
      const doc = win.document;
      doc.open();
      doc.write(`<pre>${response.data}</pre>`);
      doc.close();
    })
    .catch((error) => {
      const ctx = { message: format(error) };
      const message = translate(
        'Unable to show console log. Error message: {message}',
        ctx,
      );
      alert(message);
    });
};

export const validatePermissionsForConsoleAction = (ctx: ActionContext) => {
  if (ctx.user.is_staff) {
    return;
  }
  if (
    !ctx.user.is_support &&
    ENV.plugins.WALDUR_OPENSTACK_TENANT
      .ALLOW_CUSTOMER_USERS_OPENSTACK_CONSOLE_ACCESS
  ) {
    return;
  }
  return translate(
    'Only staff and organization users are allowed to open console.',
  );
};
