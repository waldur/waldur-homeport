import { EventGroup } from '@/events/types';
import { getAffectedUserContext, getUserContext } from '@/events/utils';
import { translate } from '@/i18n';

import { SshEnum, UsersEnum } from '../EventsEnums';

export const UserEvents: EventGroup = {
  title: translate('User management events'),
  context: getAffectedUserContext,
  events: [
    {
      key: UsersEnum.user_activated,
      title: translate('User {affected_user_link} has been activated.'),
    },
    {
      key: UsersEnum.user_creation_succeeded,
      title: translate('User {affected_user_link} has been created.'),
    },
    {
      key: UsersEnum.user_deactivated,
      title: translate('User {affected_user_link} has been deactivated.'),
    },
    {
      key: UsersEnum.user_deletion_succeeded,
      title: translate('User {affected_user_name} has been deleted.'),
    },
    {
      key: UsersEnum.user_password_updated,
      title: translate(
        'Password has been changed for user {affected_user_link}.',
      ),
    },
    {
      key: UsersEnum.user_update_succeeded,
      title: translate('User {affected_user_link} has been updated.'),
    },
  ],
};

export const SshEvents: EventGroup = {
  title: translate('SSH key management events'),
  context: getUserContext,
  events: [
    {
      key: SshEnum.ssh_key_creation_succeeded,
      title: translate(
        'SSH key {ssh_key_name} has been created for user {user_link}',
      ),
    },
    {
      key: SshEnum.ssh_key_deletion_succeeded,
      title: translate(
        'SSH key {ssh_key_name} has been deleted for user {user_link}',
      ),
    },
  ],
};
