import JupyterHubManagementCreateContainer from './create/JupyterHubManagementCreateContainer';
import JupyterHubManagementDetailsContainer from './details/JupyterHubManagementDetailsContainer';
import jupyterHubManagementRoutes from './routes';

export default module => {
  module.config(jupyterHubManagementRoutes);
  module.component('jupyterHubManagementCreateContainer', JupyterHubManagementCreateContainer);
  module.component('jupyterHubManagementDetailsContainer', JupyterHubManagementDetailsContainer);
};
