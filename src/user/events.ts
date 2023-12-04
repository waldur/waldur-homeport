import eventsRegistry from '@waldur/events/registry';
import { getAffectedUserContext, getUserContext } from '@waldur/events/utils';
import { gettext } from '@waldur/i18n';

import { UsersEnum, SshEnum } from '../EventsEnums';

eventsRegistry.registerGroup({
  title: gettext('User management events'),
  context: getAffectedUserContext,
  events: [
    {
      key: UsersEnum.user_activated,
      title: gettext('User {affected_user_link} has been activated.'),
    },
    {
      key: UsersEnum.user_creation_succeeded,
      title: gettext('User {affected_user_link} has been created.'),
    },
    {
      key: UsersEnum.user_deactivated,
      title: gettext('User {affected_user_link} has been deactivated.'),
    },
    {
      key: UsersEnum.user_deletion_succeeded,
      title: gettext('User {affected_user_name} has been deleted.'),
    },
    {
      key: UsersEnum.user_password_updated,
      title: gettext(
        'Password has been changed for user {affected_user_link}.',
      ),
    },
    {
      key: UsersEnum.user_update_succeeded,
      title: gettext('User {affected_user_link} has been updated.'),
    },
  ],
});

eventsRegistry.registerGroup({
  title: gettext('SSH key management events'),
  context: getUserContext,
  events: [
    {
      key: SshEnum.ssh_key_creation_succeeded,
      title: gettext(
        'SSH key {ssh_key_name} has been created for user {user_link}',
      ),
    },
    {
      key: SshEnum.ssh_key_deletion_succeeded,
      title: gettext(
        'SSH key {ssh_key_name} has been deleted for user {user_link}',
      ),
    },
  ],
});
