import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

export const getSupportPortalAction = () =>
  ENV.plugins.WALDUR_CORE.SUPPORT_PORTAL_URL
    ? {
        title: translate('Open support portal'),
        onClick() {
          window.open(ENV.plugins.WALDUR_CORE.SUPPORT_PORTAL_URL);
        },
      }
    : undefined;
