import eventsRegistry from '@waldur/events/registry';
import { getUserContext } from '@waldur/events/utils';
import { gettext } from '@waldur/i18n';

eventsRegistry.registerGroup({
  title: gettext('Authentication events'),
  context: getUserContext,
  events: [
    {
      key: 'auth_logged_in_with_username',
      title: gettext('User {user_link} authenticated successfully with username and password.'),
    },
    {
      key: 'auth_logged_in_with_openid',
      title: gettext('User {user_link} authenticated successfully with OpenID.'),
    },
    {
      key: 'auth_logged_in_with_google',
      title: gettext('User {user_link} authenticated successfully with Google.'),
    },
    {
      key: 'auth_logged_in_with_facebook',
      title: gettext('User {user_link} authenticated successfully with Facebook.'),
    },
    {
      key: 'auth_logged_in_with_smart_id_ee',
      title: gettext('User {user_link} authenticated successfully with Smart ID EE.'),
    },
    {
      key: 'auth_logged_in_with_saml2',
      title: gettext('User {user_link} authenticated successfully with SAML2.'),
    },
    {
      key: 'auth_logged_out_with_saml2',
      title: gettext('User {user_link} logged out  successfully with SAML2.'),
    },
  ],
});
