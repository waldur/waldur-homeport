import projectManage from './project-manage';
import projectCreate from './project-create';
import ProjectDetailsController from './project-details';
import projectPriceLimit from './project-price-limit';
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
  module.controller('ProjectDetailsController', ProjectDetailsController);
  module.component('projectPriceLimit', projectPriceLimit);
  module.component('projectIssues', projectIssues);
  module.component('projectEvents', projectEvents);
  module.component('projectsList', projectsList);
  module.component('projectAlertsList', projectAlertsList);
  module.component('projectTeam', projectTeam);
  module.service('projectsService', projectsService);
  module.config(projectRoutes);
};
