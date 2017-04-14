import projectManage from './project-manage';
import projectCreate from './project-create';
import ProjectWorkspaceController from './project-workspace';
import projectPriceLimit from './project-price-limit';
import projectDialog from './project-dialog';
import projectIssues from './project-issues';
import projectEvents from './project-events';
import projectsList from './projects-list';
import projectAlertsList from './project-alerts-list';
import projectTeam from './project-team';
import projectsService from './projects-service';
import projectRoutes from './routes';

export default module => {
  module.component('projectManage', projectManage);
  module.component('projectCreate', projectCreate);
  module.controller('ProjectWorkspaceController', ProjectWorkspaceController);
  module.component('projectPriceLimit', projectPriceLimit);
  module.component('projectDialog', projectDialog);
  module.component('projectIssues', projectIssues);
  module.component('projectEvents', projectEvents);
  module.component('projectsList', projectsList);
  module.component('projectAlertsList', projectAlertsList);
  module.component('projectTeam', projectTeam);
  module.service('projectsService', projectsService);
  module.config(projectRoutes);
};
