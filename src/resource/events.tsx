import { Link } from '@/core/Link';
import { getUserContext } from '@/events/utils';
import { translate } from '@/i18n';

import { ResourcesEnum } from '../EventsEnums';

const getResourceContext = (event) => ({
  ...getUserContext(event),
  resource_link: (
    <Link
      state="resource-details"
      params={{
        resource_type: event.resource_type,
        resource_uuid: event.resource_uuid,
        uuid: event.project_uuid,
      }}
    >
      {event.resource_name}
    </Link>
  ),
});

export const ResourceEvents = {
  title: translate('Resource events'),
  context: getResourceContext,
  events: [
    {
      key: ResourcesEnum.resource_creation_failed,
      title: translate('{resource_link} creation has failed.'),
    },
    {
      key: ResourcesEnum.resource_creation_scheduled,
      title: translate(
        '{resource_link} creation has been scheduled by {user_link}.',
      ),
    },
    {
      key: ResourcesEnum.resource_creation_succeeded,
      title: translate('{resource_link} has been created.'),
    },
    {
      key: ResourcesEnum.resource_deletion_failed,
      title: translate('{resource_link} deletion has failed.'),
    },
    {
      key: ResourcesEnum.resource_deletion_scheduled,
      title: translate(
        '{resource_link} has been scheduled to deletion by {user_link}.',
      ),
    },
    {
      key: ResourcesEnum.resource_deletion_succeeded,
      title: translate('{resource_name} has been deleted.'),
    },
    {
      key: ResourcesEnum.resource_import_succeeded,
      title: translate('{resource_link} has been imported by {user_link}.'),
    },
    {
      key: ResourcesEnum.resource_restart_failed,
      title: translate('{resource_link} restart has failed.'),
    },
    {
      key: ResourcesEnum.resource_restart_scheduled,
      title: translate(
        '{resource_link} has been scheduled to restart by {user_link}.',
      ),
    },
    {
      key: ResourcesEnum.resource_restart_succeeded,
      title: translate('{resource_link} has been restarted.'),
    },
    {
      key: ResourcesEnum.resource_start_failed,
      title: translate('{resource_link} start has failed.'),
    },
    {
      key: ResourcesEnum.resource_start_scheduled,
      title: translate(
        '{resource_link} has been scheduled to start by {user_link}.',
      ),
    },
    {
      key: ResourcesEnum.resource_start_succeeded,
      title: translate('{resource_link} has been started.'),
    },
    {
      key: ResourcesEnum.resource_stop_failed,
      title: translate('{resource_link} stop has failed.'),
    },
    {
      key: ResourcesEnum.resource_stop_scheduled,
      title: translate(
        '{resource_link} has been scheduled to stop by {user_link}.',
      ),
    },
    {
      key: ResourcesEnum.resource_stop_succeeded,
      title: translate('{resource_link} has been stopped.'),
    },
    {
      key: ResourcesEnum.resource_update_succeeded,
      title: translate('{resource_link} has been updated by {user_link}.'),
    },
  ],
};
