import registerJupyterHubManagementAppstoreCategory from './appstore-category';
import JupyterHubManagementCreateContainer from './create/JupyterHubManagementCreateContainer';
import JupyterHubManagementDetailsContainer from './details/JupyterHubManagementDetailsContainer';
import jupyterHubManagementRoutes from './routes';

export default module => {
  module.run(registerJupyterHubManagementAppstoreCategory);
  module.config(jupyterHubManagementRoutes);
  module.component('jupyterHubManagementCreateContainer', JupyterHubManagementCreateContainer);
  module.component('jupyterHubManagementDetailsContainer', JupyterHubManagementDetailsContainer);
};
