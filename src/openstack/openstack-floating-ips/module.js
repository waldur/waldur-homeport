import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './breadcrumbs';
import { OpenStackFloatingIpSummary } from './OpenStackFloatingIpSummary';

ActionConfigurationRegistry.register('OpenStack.FloatingIP', {
  order: ['pull', 'destroy'],
  options: {
    pull: {
      title: gettext('Synchronise'),
    },
  },
});

ResourceSummary.register('OpenStack.FloatingIP', OpenStackFloatingIpSummary);
