import playbookJobsModule from './playbook-jobs/module';
import pythonManagementModule from './python-management/module';
import jupyterHubManagementModule from './jupyter-hub-management/module';
import ApplicationService from './applications-service';
import applicationList from './application-list';

export default module => {
  module.service('ApplicationService', ApplicationService);
  module.component('applicationList', applicationList);
  playbookJobsModule(module);
  pythonManagementModule(module);
  jupyterHubManagementModule(module);
};
