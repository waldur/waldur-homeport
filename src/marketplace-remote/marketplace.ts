import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { COMMON_OPTIONS } from '@waldur/support/marketplace';

const RemoteOfferingSecretOptions = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RemoteOfferingSecretOptions" */ './RemoteOfferingSecretOptions'
    ),
  'RemoteOfferingSecretOptions',
);

registerOfferingType({
  type: 'Waldur.RemoteOffering',
  get label() {
    return translate('Remote offering');
  },
  ...COMMON_OPTIONS,
  showOptions: false,
  showBackendId: true,
  secretOptionsForm: RemoteOfferingSecretOptions,
});
