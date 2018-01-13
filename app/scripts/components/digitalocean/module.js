import dropletResizeDialog from './droplet-resize';
import DigitalOceanDropletConfig from './digitalocean-droplet-config';
import actionConfig from './actions';
import costPlanningConfig from './cost-planning';
import './help';
import './provider';
import { DigitalOceanDropletSummary } from './DigitalOceanDropletSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default module => {
  ResourceSummary.register('DigitalOcean.Droplet', DigitalOceanDropletSummary);
  module.directive('dropletResizeDialog', dropletResizeDialog);
  module.config(actionConfig);
  module.config(fieldsConfig);
  module.run(costPlanningConfig);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('DigitalOcean.Droplet', DigitalOceanDropletConfig);
}
