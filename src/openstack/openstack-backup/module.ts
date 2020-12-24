import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
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
ActionConfigurationRegistry.register('OpenStackTenant.Backup', actions);
