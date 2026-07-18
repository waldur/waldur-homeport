import {
  marketplaceResourceAccessSubnetsCreate,
  marketplaceResourceAccessSubnetsPartialUpdate,
} from 'waldur-js-client';

import {
  AccessSubnetFormDialog,
  AccessSubnetRow,
} from '@/access-subnets/AccessSubnetFormDialog';
import { translate } from '@/i18n';

export interface ResourceAccessSubnetFormData {
  refetch?(): void;
  resource_url?: string;
  row?: AccessSubnetRow;
}

interface ResourceAccessSubnetFormProps {
  resolve: ResourceAccessSubnetFormData;
}

export const ResourceAccessSubnetForm = ({
  resolve,
}: ResourceAccessSubnetFormProps) => (
  <AccessSubnetFormDialog
    refetch={resolve.refetch}
    row={resolve.row}
    config={{
      scopeField: 'resource',
      scopeUrl: resolve.resource_url,
      create: (body) =>
        marketplaceResourceAccessSubnetsCreate({ body: body as any }),
      update: (uuid, body) =>
        marketplaceResourceAccessSubnetsPartialUpdate({ path: { uuid }, body }),
      enforceSingleHost: true,
      placeholder: translate('Example: 192.168.1.5/32'),
      titleCreate: translate('Create access subnet'),
      titleEdit: translate('Edit access subnet'),
      successCreate: translate('Access subnet has been created.'),
      successUpdate: translate('Access subnet has been updated.'),
      errorCreate: translate('Unable to create access subnet.'),
      errorUpdate: translate('Unable to update access subnet.'),
    }}
  />
);
