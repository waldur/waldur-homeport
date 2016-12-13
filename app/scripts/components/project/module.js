import projectManage from './project-manage';
import projectCreate from './project-create';
import ProjectDetailsController from './project-details';
import projectIssues from './project-issues';
import projectsList from './projects-list';
import projectRoutes from './routes';

export default module => {
  module.directive('projectManage', projectManage);
  module.directive('projectCreate', projectCreate);
  module.controller('ProjectDetailsController', ProjectDetailsController);
  module.directive('projectIssues', projectIssues);
  module.directive('projectsList', projectsList);
  module.config(projectRoutes);
}
