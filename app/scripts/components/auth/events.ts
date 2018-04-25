import { getUserContext } from '@waldur/events/event-formatter';
import * as eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';

eventsRegistry.register({
  auth_logged_in_with_username: event =>
    translate('User {user} authenticated successfully with username and password.', getUserContext(event)),

  auth_logged_in_with_openid: event =>
    translate('User {user} authenticated successfully with OpenID.', getUserContext(event)),

  auth_logged_in_with_google: event =>
    translate('User {user} authenticated successfully with Google.', getUserContext(event)),

  auth_logged_in_with_facebook: event =>
    translate('User {user} authenticated successfully with Facebook.', getUserContext(event)),

  auth_logged_in_with_smart_id_ee: event =>
    translate('User {user} authenticated successfully with Smart ID EE.', getUserContext(event)),
});
