import { connectAngularComponent } from '@waldur/store/connect';

import certificationsService from './certifications-service';
import projectPolicies from './project-policies';
import projectsService from './projects-service';
import { ProjectSidebar } from './ProjectSidebar';
import projectRoutes from './routes';
import teamModule from './team/module';

import './events';

export default module => {
  module.component('projectSidebar', connectAngularComponent(ProjectSidebar));
  module.component('projectPolicies', projectPolicies);
  module.service('projectsService', projectsService);
  module.service('certificationsService', certificationsService);
  module.config(projectRoutes);
  teamModule(module);
};
