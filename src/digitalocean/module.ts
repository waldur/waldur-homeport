import * as ResourceSummary from '@waldur/resource/summary/registry';
import { connectAngularComponent } from '@waldur/store/connect';

import './actions';
import { DigitalOceanDropletSummary } from './DigitalOceanDropletSummary';
import { DropletResizeDialog } from './DropletResizeDialog';

import './help';
import './provider';

export default module => {
  ResourceSummary.register('DigitalOcean.Droplet', DigitalOceanDropletSummary);
  module.component(
    'dropletResizeDialog',
    connectAngularComponent(DropletResizeDialog, ['resolve']),
  );
};
