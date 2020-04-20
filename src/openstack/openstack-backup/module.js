import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import breadcrumbsConfig from './breadcrumbs';
import openstackBackupRestoreSummary from './openstack-backup-restore-summary';
import { OpenStackBackupSummary } from './OpenStackBackupSummary';
import tabsConfig from './tabs';

// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.Backup', actions);
}

export default module => {
  ResourceSummary.register('OpenStackTenant.Backup', OpenStackBackupSummary);
  module.component(
    'openstackBackupRestoreSummary',
    openstackBackupRestoreSummary,
  );
  module.config(actionsConfig);
  module.config(tabsConfig);
  module.run(breadcrumbsConfig);
};
