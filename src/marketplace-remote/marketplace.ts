import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { Attribute } from '@waldur/marketplace/types';
import { COMMON_OPTIONS } from '@waldur/support/marketplace';

import { REMOTE_OFFERING_TYPE } from './constants';

const RemoteOfferingSecretOptions = lazyComponent(
  () => import('./RemoteOfferingSecretOptions'),
  'RemoteOfferingSecretOptions',
);

const RemoteOfferingOptionsSummary = (): Attribute[] => [
  {
    key: 'template_confirmation_comment',
    title: translate('Confirmation notification template'),
    type: 'string',
  },
  {
    key: 'service_provider_can_create_offering_user',
    title: translate('Allow service provider to create offering users.'),
    type: 'boolean',
  },
  {
    key: 'api_url',
    title: translate('API URL'),
    type: 'string',
  },
  {
    key: 'token',
    title: translate('Token'),
    type: 'password',
  },
  {
    key: 'customer_uuid',
    title: translate('Organization UUID'),
    type: 'string',
  },
];

registerOfferingType({
  type: REMOTE_OFFERING_TYPE,
  get label() {
    return translate('Remote offering');
  },
  ...COMMON_OPTIONS,
  showOptions: false,
  showBackendId: true,
  secretOptionsForm: RemoteOfferingSecretOptions,
  optionsSummary: RemoteOfferingOptionsSummary,
});
