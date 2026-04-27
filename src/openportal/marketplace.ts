import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';
import { OPENPORTAL_PLUGIN } from '@/openportal/constants';

const OpenPortalCredentialsForm = lazyComponent(() =>
  import('./OpenPortalCredentialsForm').then((module) => ({
    default: module.OpenPortalCredentialsForm,
  })),
);

const OpenPortalOrderForm = lazyComponent(() =>
  import('./OpenPortalOrderForm').then((module) => ({
    default: module.OpenPortalOrderForm,
  })),
);

export const OpenPortalOffering: OfferingConfiguration = {
  type: OPENPORTAL_PLUGIN,
  get label() {
    return translate('OpenPortal allocation');
  },
  orderFormComponent: OpenPortalOrderForm,
  credentialsForm: OpenPortalCredentialsForm,
};
