import projectManage from './project-manage';
import projectCreate from './project-create';
import ProjectDetailsController from './project-details';
import projectIssues from './project-issues';
import projectEvents from './project-events';
import projectsList from './projects-list';
import projectAlertsList from './project-alerts-list';
import projectTeam from './project-team';
import projectRoutes from './routes';

export default module => {
  module.directive('projectManage', projectManage);
  module.directive('projectCreate', projectCreate);
  module.controller('ProjectDetailsController', ProjectDetailsController);
  module.directive('projectIssues', projectIssues);
  module.directive('projectEvents', projectEvents);
  module.directive('projectsList', projectsList);
  module.component('projectAlertsList', projectAlertsList);
  module.component('projectTeam', projectTeam);
  module.config(projectRoutes);
};
