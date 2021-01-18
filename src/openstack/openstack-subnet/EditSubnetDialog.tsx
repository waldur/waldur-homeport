import { translate } from '@waldur/i18n';
import { updateSubnet } from '@waldur/openstack/api';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

import { getFields } from './fields';

export const EditSubnetDialog = ({ resolve: { resource } }) => {
  return (
    <UpdateResourceDialog
      fields={getFields()}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
        gateway_ip: resource.gateway_ip,
        disable_gateway: resource.disable_gateway,
        enable_default_gateway: resource.enable_default_gateway,
        host_routes: resource.host_routes,
        dns_nameservers: resource.dns_nameservers,
      }}
      updateResource={updateSubnet}
      verboseName={translate('OpenStack subnet')}
    />
  );
};
