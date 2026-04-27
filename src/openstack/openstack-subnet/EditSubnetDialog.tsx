import { FC } from 'react';
import { openstackSubnetsUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionDialogProps } from '@/resource/actions/types';
import { UpdateResourceDialog } from '@/resource/actions/UpdateResourceDialog';

import { InternalNetworkAllocationPool } from './AllocationPoolsField';
import { getFields } from './fields';

export const EditSubnetDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const fields = getFields();
  fields.push({
    name: 'allocation_pools',
    component: InternalNetworkAllocationPool,
  });
  return (
    <UpdateResourceDialog
      fields={fields}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
        gateway_ip: resource.gateway_ip,
        disable_gateway: resource.disable_gateway,
        host_routes: resource.host_routes,
        dns_nameservers: resource.dns_nameservers,
        allocation_pools: resource.allocation_pools,
      }}
      updateResource={(uuid, body) =>
        openstackSubnetsUpdate({ path: { uuid }, body })
      }
      verboseName={translate('OpenStack subnet')}
      refetch={refetch}
    />
  );
};
