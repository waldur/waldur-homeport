import playbookJobsModule from './playbook-jobs/module';
import ApplicationService from './applications-service';
import applicationList from './application-list';

export default module => {
  module.service('ApplicationService', ApplicationService);
  module.component('applicationList', applicationList);
  playbookJobsModule(module);
};
