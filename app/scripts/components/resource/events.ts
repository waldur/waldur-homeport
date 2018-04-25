import { getLink, getUserContext } from '@waldur/events/event-formatter';
import * as eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';

const getResourceContext = event => {
  const ctx = {
    resource_type: event.resource_type,
    uuid: event.resource_uuid,
  };
  const resource = getLink('resources.details', ctx, event.resource_name);
  return { ...getUserContext(event), resource };
};

eventsRegistry.register({
  resource_creation_failed: event =>
    translate('{resource} creation has failed.', getResourceContext(event)),

  resource_creation_scheduled: event =>
    translate('{resource} creation has been scheduled by {user}.', getResourceContext(event)),

  resource_creation_succeeded: event =>
    translate('{resource} has been created.', getResourceContext(event)),

  resource_deletion_failed: event =>
    translate('{resource} deletion has failed.', getResourceContext(event)),

  resource_deletion_scheduled: event =>
    translate('{resource} has been scheduled to deletion by {user}.', getResourceContext(event)),

  resource_deletion_succeeded: event =>
    translate('{resource} has been deleted.', getResourceContext(event)),

  resource_import_succeeded: event =>
    translate('{resource} has been imported by {user}.', getResourceContext(event)),

  resource_restart_failed: event =>
    translate('{resource} restart has failed.', getResourceContext(event)),

  resource_restart_scheduled: event =>
    translate('{resource} has been scheduled to restart by {user}.', getResourceContext(event)),

  resource_restart_succeeded: event =>
    translate('{resource} has been restarted.', getResourceContext(event)),

  resource_start_failed: event =>
    translate('{resource} start has failed.', getResourceContext(event)),

  resource_start_scheduled: event =>
    translate('{resource} has been scheduled to start by {user}.', getResourceContext(event)),

  resource_start_succeeded: event =>
    translate('{resource} has been started.', getResourceContext(event)),

  resource_stop_failed: event =>
    translate('{resource} stop has failed.', getResourceContext(event)),

  resource_stop_scheduled: event =>
    translate('{resource} has been scheduled to stop by {user}.', getResourceContext(event)),

  resource_stop_succeeded: event =>
    translate('{resource} has been stopped.', getResourceContext(event)),

  resource_update_succeeded: event =>
    translate('{resource} has been updated by {user}.', getResourceContext(event)),
});
