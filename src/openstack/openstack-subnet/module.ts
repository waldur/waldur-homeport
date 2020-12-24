import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions';
import './breadcrumbs';
import './tabs';

const OpenStackSubNetSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackSubNetSummary" */ './OpenStackSubNetSummary'
    ),
  'OpenStackSubNetSummary',
);

ResourceSummary.register('OpenStack.SubNet', OpenStackSubNetSummary);
