import { ENV } from '@waldur/core/config';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionContext } from '@waldur/resource/actions/types';

import { listToDict } from '../core/utils';

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

const PRIVATE_CIDR_PATTERN = new RegExp(
  // Class A: 10.0.0.0/8 - 10.255.255.255/32
  '(^(10)(.([2]([0-5][0-5]|[01234][6-9])|[1][0-9][0-9]|[1-9][0-9]|[0-9])){2}.([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/([89]|[12][0-9]|3[0-2])$)' +
    // Class B: 172.16.0.0/12 - 172.31.255.255/32
    '|(^(172).(1[6-9]|2[0-9]|3[0-1])(.(2[0-4][0-9]|25[0-5]|[1][0-9][0-9]|[1-9][0-9]|[0-9])).([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/(1[2-9]|2[0-9]|3[0-2])$)' +
    // Class C: 192.168.0.0/16 - 192.168.255.255/32
    '|(^(192).(168)(.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])).([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/(1[6-9]|2[0-9]|3[0-2])$)',
);

const VOLUME_NAME_PATTERN = new RegExp('^[A-Za-z0-9\\-]+$');

const IPv4_ADDRESS_PATTERN =
  /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;

export const validateIPv4 = (value) => {
  if (!value) {
    return;
  }
  if (!value.match(IPv4_ADDRESS_PATTERN)) {
    return translate('Enter IPv4 address.');
  }
};

export const validatePrivateCIDR = (value) => {
  if (!value) {
    return;
  }
  if (!value.match(PRIVATE_CIDR_PATTERN)) {
    return translate('Enter private IPv4 CIDR.');
  }
};

const volumeName = (value: string) => {
  if (!value) {
    return undefined;
  }
  if (value.length < 2) {
    return translate(
      'Name is too short, names should be at least two alphanumeric characters.',
    );
  }
  if (!value.match(VOLUME_NAME_PATTERN)) {
    return translate(
      'Name should consist of latin symbols, numbers and dashes.',
    );
  }
};

export const getVolumeNameValidators = () => {
  const validators = [required];
  if (ENV.enforceLatinName) {
    validators.push(volumeName);
  }
  return validators;
};

export const validateOpenStackInstancePowerPermission = (
  ctx: ActionContext,
) => {
  if (ctx.user?.is_staff) {
    return;
  }

  const resource = ctx.resource;
  if (!resource) {
    return translate('Resource not found.');
  }

  const hasProjectPermission = hasPermission(ctx.user, {
    permission: PermissionEnum.CAN_MANAGE_OPENSTACK_INSTANCE_POWER,
    projectId: resource.project_uuid,
  });

  const hasCustomerPermission = hasPermission(ctx.user, {
    permission: PermissionEnum.CAN_MANAGE_OPENSTACK_INSTANCE_POWER,
    customerId: resource.customer_uuid,
  });

  if (!hasProjectPermission && !hasCustomerPermission) {
    return translate(
      'You do not have permission to manage power operations for this instance.',
    );
  }
};

export const validateOpenStackInstanceManagePermission = (
  ctx: ActionContext,
) => {
  if (ctx.user?.is_staff) {
    return;
  }

  const resource = ctx.resource;
  if (!resource) {
    return translate('Resource not found.');
  }

  const hasProjectPermission = hasPermission(ctx.user, {
    permission: PermissionEnum.CAN_MANAGE_OPENSTACK_INSTANCE,
    projectId: resource.project_uuid,
  });

  const hasCustomerPermission = hasPermission(ctx.user, {
    permission: PermissionEnum.CAN_MANAGE_OPENSTACK_INSTANCE,
    customerId: resource.customer_uuid,
  });

  if (!hasProjectPermission && !hasCustomerPermission) {
    return translate('You do not have permission to manage this instance.');
  }
};

export const validateOpenStackInstanceConsolePermission = (
  ctx: ActionContext,
) => {
  if (ctx.user?.is_staff) {
    return;
  }

  const resource = ctx.resource;
  if (!resource) {
    return translate('Resource not found.');
  }

  if (
    !ENV.plugins.WALDUR_OPENSTACK.ALLOW_CUSTOMER_USERS_OPENSTACK_CONSOLE_ACCESS
  ) {
    return translate('Console access is not allowed for customer users.');
  }

  const hasProjectPermission = hasPermission(ctx.user, {
    permission: PermissionEnum.HAS_OPENSTACK_INSTANCE_CONSOLE_ACCESS,
    projectId: resource.project_uuid,
  });

  const hasCustomerPermission = hasPermission(ctx.user, {
    permission: PermissionEnum.HAS_OPENSTACK_INSTANCE_CONSOLE_ACCESS,
    customerId: resource.customer_uuid,
  });

  if (!hasProjectPermission && !hasCustomerPermission) {
    return translate(
      'You do not have permission to access the console for this instance.',
    );
  }
};
