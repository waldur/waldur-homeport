import routes from './routes';
import pythonManagementState from './python-management-state';
import registerAppstoreCategory from './appstore-category';
import injectServices from './services';
import PythonManagementCreateContainer from './create/PythonManagementCreateContainer';
import PythonManagementDetailsContainer from './details/PythonManagementDetailsContainer';

export default module => {
  module.config(routes);
  module.component('pythonManagementState', pythonManagementState);
  module.component('pythonManagementCreateContainer', PythonManagementCreateContainer);
  module.component('pythonManagementDetailsContainer', PythonManagementDetailsContainer);
  module.run(injectServices);
  module.run(registerAppstoreCategory);
};
