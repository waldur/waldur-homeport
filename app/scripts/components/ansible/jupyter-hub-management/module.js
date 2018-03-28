import registerAppstoreCategory from './appstore-category';
import JupyterHubManagementCreateContainer from './create/JupyterHubManagementCreateContainer';
import JupyterHubManagementDetailsContainer from './details/JupyterHubManagementDetailsContainer';
import routes from './routes';

export default module => {
  module.config(routes);
  module.run(registerAppstoreCategory);
  module.component('jupyterHubManagementCreateContainer', JupyterHubManagementCreateContainer);
  module.component('jupyterHubManagementDetailsContainer', JupyterHubManagementDetailsContainer);
};
