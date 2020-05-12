import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions';
import { DigitalOceanDropletSummary } from './DigitalOceanDropletSummary';
import dropletResizeDialog from './droplet-resize';
import './help';
import './provider';

export default module => {
  ResourceSummary.register('DigitalOcean.Droplet', DigitalOceanDropletSummary);
  module.directive('dropletResizeDialog', dropletResizeDialog);
};
