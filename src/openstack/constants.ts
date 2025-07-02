import { translate } from '@waldur/i18n';

export const TENANT_TYPE = 'OpenStack.Tenant';

export const INSTANCE_TYPE = 'OpenStack.Instance';

export const VOLUME_TYPE = 'OpenStack.Volume';

export const OPENSTACK_PORT_TYPE = 'OpenStack.Port';

const FIXED_STORAGE_MODE = 'fixed';

const DYNAMIC_STORAGE_MODE = 'dynamic';

export const STORAGE_MODE_OPTIONS = [
  {
    label: translate('Fixed — use common storage quota'),
    value: FIXED_STORAGE_MODE,
  },
  {
    label: translate(
      'Dynamic — use separate volume types for tracking pricing',
    ),
    value: DYNAMIC_STORAGE_MODE,
  },
];
