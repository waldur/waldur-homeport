import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export const getSupportPortalAction = () => ENV.supportPortalURL ? ({
  title: translate('Open support portal'),
  onClick() {
    window.open(ENV.supportPortalURL);
  },
}) : undefined;
