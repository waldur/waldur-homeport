import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';
import { OPENPORTAL_PLUGIN } from '@waldur/openportal/constants';

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
