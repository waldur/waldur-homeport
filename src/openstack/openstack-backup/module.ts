import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import './breadcrumbs';
const OpenStackBackupSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackBackupSummary" */ './OpenStackBackupSummary'
    ),
  'OpenStackBackupSummary',
);

import './tabs';

ResourceSummary.register('OpenStackTenant.Backup', OpenStackBackupSummary);
ActionRegistry.register('OpenStackTenant.Backup', actions);
