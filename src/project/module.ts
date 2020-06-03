import { connectAngularComponent } from '@waldur/store/connect';

import projectPolicies from './project-policies';
import { ProjectSidebar } from './ProjectSidebar';
import teamModule from './team/module';

import './events';

export default module => {
  module.component('projectSidebar', connectAngularComponent(ProjectSidebar));
  module.component('projectPolicies', projectPolicies);
  teamModule(module);
};
