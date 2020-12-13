import { lazyComponent } from '@waldur/core/lazyComponent';
import { gettext } from '@waldur/i18n';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './breadcrumbs';
const OpenStackFloatingIpSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackFloatingIpSummary" */ './OpenStackFloatingIpSummary'
    ),
  'OpenStackFloatingIpSummary',
);

ActionConfigurationRegistry.register('OpenStack.FloatingIP', {
  order: ['pull', 'destroy'],
  options: {
    pull: {
      title: gettext('Synchronise'),
    },
  },
});

ResourceSummary.register('OpenStack.FloatingIP', OpenStackFloatingIpSummary);
