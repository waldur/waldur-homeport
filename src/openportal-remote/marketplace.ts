import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';
import { OPENPORTAL_REMOTE_PLUGIN } from '@/openportal-remote/constants';

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
