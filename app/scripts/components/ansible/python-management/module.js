import injectServices from './services';
import PythonManagementCreateContainer from './create/PythonManagementCreateContainer';
import PythonManagementDetailsContainer from './details/PythonManagementDetailsContainer';
import pythonManagementRoutes from './routes';

export default module => {
  module.config(pythonManagementRoutes);
  module.component('pythonManagementCreateContainer', PythonManagementCreateContainer);
  module.component('pythonManagementDetailsContainer', PythonManagementDetailsContainer);
  module.run(injectServices);
};
