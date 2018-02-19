import injectServices from './services';
import PythonManagementCreateContainer from './create/PythonManagementCreateContainer';
import PythonManagementDetailsContainer from './details/PythonManagementDetailsContainer';

export default module => {
  module.component('pythonManagementCreateContainer', PythonManagementCreateContainer);
  module.component('pythonManagementDetailsContainer', PythonManagementDetailsContainer);
  module.run(injectServices);
};
