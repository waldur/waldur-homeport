import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';
import { OPENPORTAL_REMOTE_PLUGIN } from '@/openportal-remote/constants';

const OpenPortalRemoteCredentialsSection = lazyComponent(() =>
  import('./OpenPortalRemoteCredentialsSection').then((module) => ({
    default: module.OpenPortalRemoteCredentialsSection,
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
  credentialsSection: OpenPortalRemoteCredentialsSection,
};
