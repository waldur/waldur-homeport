import dropletResizeDialog from './droplet-resize';
import digitaloceanDropletSummary from './digitalocean-droplet-summary';
import DigitalOceanDropletConfig from './digitalocean-droplet-config';
import actionConfig from './actions';
import costPlanningConfig from './cost-planning';

export default module => {
  module.directive('dropletResizeDialog', dropletResizeDialog);
  module.component('digitaloceanDropletSummary', digitaloceanDropletSummary);
  module.config(actionConfig);
  module.config(fieldsConfig);
  module.run(costPlanningConfig);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('DigitalOcean.Droplet', DigitalOceanDropletConfig);
}
