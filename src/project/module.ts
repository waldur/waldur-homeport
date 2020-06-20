import projectPolicies from './project-policies';
import teamModule from './team/module';

import './events';

export default (module) => {
  module.component('projectPolicies', projectPolicies);
  teamModule(module);
};
