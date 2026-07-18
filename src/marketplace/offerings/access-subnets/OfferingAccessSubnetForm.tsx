import {
  marketplaceOfferingAccessSubnetsCreate,
  marketplaceOfferingAccessSubnetsPartialUpdate,
} from 'waldur-js-client';

import {
  AccessSubnetFormDialog,
  AccessSubnetRow,
} from '@/access-subnets/AccessSubnetFormDialog';
import { translate } from '@/i18n';

export interface OfferingAccessSubnetFormData {
  refetch?(): void;
  offering_url?: string;
  row?: AccessSubnetRow;
}

interface OfferingAccessSubnetFormProps {
  resolve: OfferingAccessSubnetFormData;
}

export const OfferingAccessSubnetForm = ({
  resolve,
}: OfferingAccessSubnetFormProps) => (
  <AccessSubnetFormDialog
    refetch={resolve.refetch}
    row={resolve.row}
    config={{
      scopeField: 'offering',
      scopeUrl: resolve.offering_url,
      create: (body) =>
        marketplaceOfferingAccessSubnetsCreate({ body: body as any }),
      update: (uuid, body) =>
        marketplaceOfferingAccessSubnetsPartialUpdate({ path: { uuid }, body }),
      placeholder: translate('Example: 10.0.0.0/24'),
      titleCreate: translate('Add default access subnet'),
      titleEdit: translate('Edit default access subnet'),
      successCreate: translate('Default access subnet has been created.'),
      successUpdate: translate('Default access subnet has been updated.'),
      errorCreate: translate('Unable to create default access subnet.'),
      errorUpdate: translate('Unable to update default access subnet.'),
    }}
  />
);
