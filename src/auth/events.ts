import eventsRegistry from '@waldur/events/registry';
import { getUserContext } from '@waldur/events/utils';
import { gettext } from '@waldur/i18n';

import { AuthEnum, UsersEnum } from '../EventsEnums';

eventsRegistry.registerGroup({
  title: gettext('Authentication events'),
  context: getUserContext,
  events: [
    {
      key: AuthEnum.auth_logged_in_with_username,
      title: gettext(
        'User {user_link} authenticated successfully with username and password.',
      ),
    },
    {
      key: UsersEnum.auth_logged_in_with_saml2,
      title: gettext('User {user_link} authenticated successfully with SAML2.'),
    },
    {
      key: UsersEnum.auth_logged_out_with_saml2,
      title: gettext('User {user_link} logged out successfully with SAML2.'),
    },
  ],
});
