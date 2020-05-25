import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions';
import { DigitalOceanDropletSummary } from './DigitalOceanDropletSummary';
import './help';
import './provider';

export default () => {
  ResourceSummary.register('DigitalOcean.Droplet', DigitalOceanDropletSummary);
};
