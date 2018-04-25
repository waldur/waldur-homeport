import { getAffectedUserContext } from '@waldur/events/event-formatter';
import * as eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';

eventsRegistry.register({
  user_activated: event =>
    translate('User {affectedUser} has been activated.', getAffectedUserContext(event)),

  user_creation_succeeded: event =>
    translate('User {affectedUser} has been created.', getAffectedUserContext(event)),

  user_deactivated: event =>
    translate('User {affectedUser} has been deactivated.', getAffectedUserContext(event)),

  user_deletion_succeeded: event =>
    translate('User {affectedUser} has been deleted.', getAffectedUserContext(event)),

  user_password_updated: event =>
    translate('Password has been changed for user {affectedUser}.', getAffectedUserContext(event)),

  user_update_succeeded: event =>
    translate('User {affectedUser} has been updated.', getAffectedUserContext(event)),

  ssh_key_creation_succeeded: event =>
    translate('SSH key {ssh_key_name} has been created for user {user}.', event),

  ssh_key_deletion_succeeded: event =>
    translate('SSH key {ssh_key_name} has been deleted for user {user}.', event),
});
