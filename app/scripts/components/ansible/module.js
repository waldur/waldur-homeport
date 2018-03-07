import ansibleRoutes from './routes';
import AnsiblePlaybooksService from './ansible-playbook-service';
import AnsibleJobsService from './ansible-jobs-service';
import ansibleJobState from './ansible-job-state';
import ansibleJobsList from './ansible-jobs-list';
import registerAppstoreCategory from './appstore-category';
import registerSidebarExtension from './sidebar';
import createModule from './create/module';
import detailsModule from './details/module';
import ApplicationService from './applications.service';

export default module => {
  module.config(ansibleRoutes);
  module.service('AnsiblePlaybooksService', AnsiblePlaybooksService);
  module.service('AnsibleJobsService', AnsibleJobsService);
  module.service('ApplicationService', ApplicationService);
  module.component('ansibleJobState', ansibleJobState);
  module.component('ansibleJobsList', ansibleJobsList);
  module.run(registerAppstoreCategory);
  module.run(registerSidebarExtension);
  createModule(module);
  detailsModule(module);
};
