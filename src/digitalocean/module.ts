import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions';
import './help';
import './provider';
const DigitalOceanDropletSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "DigitalOceanDropletSummary" */ './DigitalOceanDropletSummary'
    ),
  'DigitalOceanDropletSummary',
);

ResourceSummary.register('DigitalOcean.Droplet', DigitalOceanDropletSummary);
