import eventsRegistry from '@waldur/events/registry';
import { getLink } from '@waldur/events/utils';
import { gettext } from '@waldur/i18n';

const getOpenStackContext = event => {
  const ctx = {
    resource_type: event.resource_type,
    uuid: event.tenant_uuid,
  };
  return {
    tenant_link: getLink('resources.details', ctx, event.tenant_name),
  };
};

eventsRegistry.registerGroup({
  title: gettext('OpenStack events'),
  context: getOpenStackContext,
  events: [
    {
      key: 'openstack_package_created',
      title: gettext('OpenStack package {tenant_link} has been created.'),
    },
    {
      key: 'openstack_package_deleted',
      title: gettext('OpenStack package {tenant_name} has been deleted.'),
    },
  ],
});
