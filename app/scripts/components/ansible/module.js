import ansibleRoutes from './routes';
import AnsiblePlaybooksService from './ansible-playbook-service';
import registerAppstoreCategory from './appstore-category';

export default module => {
  module.config(ansibleRoutes);
  module.service('AnsiblePlaybooksService', AnsiblePlaybooksService);
  module.run(registerAppstoreCategory);
};
