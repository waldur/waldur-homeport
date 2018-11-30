import ansibleRoutes from './routes';
import AnsiblePlaybooksService from './ansible-playbook-service';
import AnsibleJobsService from './ansible-jobs-service';
import ansibleJobState from './JobStateIndicator';
import registerPlaybookJobsAppstoreCategory from './appstore-category';
import createModule from './create/module';
import detailsModule from './details/module';
import registerSidebarExtension from './sidebar';

export default module => {
  module.config(ansibleRoutes);
  module.run(registerPlaybookJobsAppstoreCategory);
  module.run(registerSidebarExtension);
  module.component('ansibleJobState', ansibleJobState);
  module.service('AnsiblePlaybooksService', AnsiblePlaybooksService);
  module.service('AnsibleJobsService', AnsibleJobsService);
  createModule(module);
  detailsModule(module);
};
