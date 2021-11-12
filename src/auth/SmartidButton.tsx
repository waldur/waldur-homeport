import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

import { LoginButton } from './LoginButton';
import { getOauthCallback } from './utils';

const SmartidLogo = require('./SmartidLogo.svg');

export const SmartidButton = () => (
  <LoginButton
    label={translate('trusted identity')}
    image={SmartidLogo}
    onClick={getOauthCallback({
      name: 'smartidee',
      clientId: ENV.plugins.WALDUR_AUTH_SOCIAL.SMARTIDEE_CLIENT_ID,
      authUrl: 'https://id.smartid.ee/oauth/authorize',
      scope: '',
    })}
  />
);
