import { EventGroup } from '@/events/types';
import { getProjectContext } from '@/events/utils';
import { translate } from '@/i18n';

import { ProjectsEnum } from '../EventsEnums';

export const ProjectEvents: EventGroup = {
  title: translate('Project events'),
  context: getProjectContext,
  events: [
    {
      key: ProjectsEnum.project_creation_succeeded,
      title: translate('Project {project_link} has been created.'),
    },
    {
      key: ProjectsEnum.project_deletion_succeeded,
      title: translate('Project {project_name} has been deleted.'),
    },
    {
      key: ProjectsEnum.project_update_succeeded,
      title: translate('Project {project_link} has been updated.'),
    },
  ],
};
