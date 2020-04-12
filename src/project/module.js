import { connectAngularComponent } from '@waldur/store/connect';

import certificationsService from './certifications-service';
import projectBase from './project-base';
import projectPolicies from './project-policies';
import projectTeam from './project-team';
import projectCreate from './ProjectCreateContainer';
import ProjectDashboard from './ProjectDashboardContainer';
import projectDetailsButton from './ProjectDetailsButton';
import projectDialog from './ProjectDetailsDialog';
import projectEvents from './ProjectEventsList';
import projectIssues from './ProjectIssuesList';
import projectRemoveDialog from './ProjectRemoveDialog';
import projectsService from './projects-service';
import { ProjectSidebar } from './ProjectSidebar';
import projectsList from './ProjectsList';
import projectRoutes from './routes';

import './events';

export default module => {
  module.directive('projectBase', projectBase);
  module.component('projectSidebar', connectAngularComponent(ProjectSidebar));
  module.component('projectDashboard', ProjectDashboard);
  module.component('projectDetailsButton', projectDetailsButton);
  module.component('projectCreate', projectCreate);
  module.component('projectPolicies', projectPolicies);
  module.component('projectDialog', projectDialog);
  module.component('projectIssues', projectIssues);
  module.component('projectEvents', projectEvents);
  module.component('projectsList', projectsList);
  module.component('projectTeam', projectTeam);
  module.component('projectRemoveDialog', projectRemoveDialog);
  module.service('projectsService', projectsService);
  module.service('certificationsService', certificationsService);
  module.config(projectRoutes);
};
