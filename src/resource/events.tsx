import { UISref } from '@uirouter/react';

import eventsRegistry from '@waldur/events/registry';
import { getUserContext } from '@waldur/events/utils';
import { gettext } from '@waldur/i18n';

const getResourceContext = (event) => ({
  ...getUserContext(event),
  resource_link: (
    <UISref
      to="resource-details"
      params={{
        resource_type: event.resource_type,
        resource_uuid: event.resource_uuid,
        uuid: event.project_uuid,
      }}
    >
      <a>{event.resource_name}</a>
    </UISref>
  ),
});

eventsRegistry.registerGroup({
  title: gettext('Resource events'),
  context: getResourceContext,
  events: [
    {
      key: 'resource_creation_failed',
      title: gettext('{resource_link} creation has failed.'),
    },
    {
      key: 'resource_creation_scheduled',
      title: gettext(
        '{resource_link} creation has been scheduled by {user_link}.',
      ),
    },
    {
      key: 'resource_creation_succeeded',
      title: gettext('{resource_link} has been created.'),
    },
    {
      key: 'resource_deletion_failed',
      title: gettext('{resource_link} deletion has failed.'),
    },
    {
      key: 'resource_deletion_scheduled',
      title: gettext(
        '{resource_link} has been scheduled to deletion by {user_link}.',
      ),
    },
    {
      key: 'resource_deletion_succeeded',
      title: gettext('{resource_name} has been deleted.'),
    },
    {
      key: 'resource_import_succeeded',
      title: gettext('{resource_link} has been imported by {user_link}.'),
    },
    {
      key: 'resource_restart_failed',
      title: gettext('{resource_link} restart has failed.'),
    },
    {
      key: 'resource_restart_scheduled',
      title: gettext(
        '{resource_link} has been scheduled to restart by {user_link}.',
      ),
    },
    {
      key: 'resource_restart_succeeded',
      title: gettext('{resource_link} has been restarted.'),
    },
    {
      key: 'resource_start_failed',
      title: gettext('{resource_link} start has failed.'),
    },
    {
      key: 'resource_start_scheduled',
      title: gettext(
        '{resource_link} has been scheduled to start by {user_link}.',
      ),
    },
    {
      key: 'resource_start_succeeded',
      title: gettext('{resource_link} has been started.'),
    },
    {
      key: 'resource_stop_failed',
      title: gettext('{resource_link} stop has failed.'),
    },
    {
      key: 'resource_stop_scheduled',
      title: gettext(
        '{resource_link} has been scheduled to stop by {user_link}.',
      ),
    },
    {
      key: 'resource_stop_succeeded',
      title: gettext('{resource_link} has been stopped.'),
    },
    {
      key: 'resource_update_succeeded',
      title: gettext('{resource_link} has been updated by {user_link}.'),
    },
  ],
});
