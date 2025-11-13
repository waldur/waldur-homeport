import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';
import { OPENPORTAL_REMOTE_PLUGIN } from '@waldur/openportal-remote/constants';

const OpenPortalRemoteCredentialsForm = lazyComponent(() =>
  import('./OpenPortalRemoteCredentialsForm').then((module) => ({
    default: module.OpenPortalRemoteCredentialsForm,
  })),
);

const OpenPortalRemoteOrderForm = lazyComponent(() =>
  import('./OpenPortalRemoteOrderForm').then((module) => ({
    default: module.OpenPortalRemoteOrderForm,
  })),
);

export const OpenPortalRemoteOffering: OfferingConfiguration = {
  type: OPENPORTAL_REMOTE_PLUGIN,
  get label() {
    return translate('OpenPortal remote allocation');
  },
  orderFormComponent: OpenPortalRemoteOrderForm,
  credentialsForm: OpenPortalRemoteCredentialsForm,
};
