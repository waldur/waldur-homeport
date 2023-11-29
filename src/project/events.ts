import eventsRegistry from '@waldur/events/registry';
import { getProjectContext } from '@waldur/events/utils';
import { gettext } from '@waldur/i18n';

import { ProjectsEnum } from '../EventsEnums';

eventsRegistry.registerGroup({
  title: gettext('Project events'),
  context: getProjectContext,
  events: [
    {
      key: ProjectsEnum.project_creation_succeeded,
      title: gettext('Project {project_link} has been created.'),
    },
    {
      key: ProjectsEnum.project_deletion_succeeded,
      title: gettext('Project {project_name} has been deleted.'),
    },
    {
      key: ProjectsEnum.project_update_succeeded,
      title: gettext('Project {project_link} has been updated.'),
    },
  ],
});
