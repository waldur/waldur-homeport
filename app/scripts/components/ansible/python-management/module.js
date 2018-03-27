import pythonManagementRoutes from './routes';
import injectServices from './services';
import registerPythonManagementAppstoreCategory from './appstore-category';
import pythonManagementState from './python-management-state';
import PythonManagementCreateContainer from './create/PythonManagementCreateContainer';
import PythonManagementDetailsContainer from './details/PythonManagementDetailsContainer';

export default module => {
  module.config(pythonManagementRoutes);
  module.run(injectServices);
  module.run(registerPythonManagementAppstoreCategory);
  module.component('pythonManagementState', pythonManagementState);
  module.component('pythonManagementCreateContainer', PythonManagementCreateContainer);
  module.component('pythonManagementDetailsContainer', PythonManagementDetailsContainer);
};
