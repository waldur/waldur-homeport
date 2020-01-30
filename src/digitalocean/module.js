import dropletResizeDialog from './droplet-resize';
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
  module.run(costPlanningConfig);
};
