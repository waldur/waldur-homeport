import { getProjectContext } from '@waldur/events/event-formatter';
import * as eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';

eventsRegistry.register({
  project_creation_succeeded: event =>
    translate('Project {project} has been created.', getProjectContext(event)),

  project_deletion_succeeded: event =>
    translate('Project {project} has been deleted.', getProjectContext(event)),

  project_name_update_succeeded: event =>
    translate('Project has been renamed from {project_previous_name} to {project}.', getProjectContext(event)),

  project_update_succeeded: event =>
    translate('Project {project} has been updated.', getProjectContext(event)),
});
