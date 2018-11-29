import routes from './routes';
import injectServices from './services';
import registerAppstoreCategory from './appstore-category';
import PythonManagementCreateContainer from './create/PythonManagementCreateContainer';
import PythonManagementDetailsContainer from './details/PythonManagementDetailsContainer';

export default module => {
  module.config(routes);
  module.run(injectServices);
  module.run(registerAppstoreCategory);
  module.component('pythonManagementCreateContainer', PythonManagementCreateContainer);
  module.component('pythonManagementDetailsContainer', PythonManagementDetailsContainer);
};
