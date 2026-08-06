import {
  accessSubnetsCreate,
  accessSubnetsPartialUpdate,
} from 'waldur-js-client';

import {
  AccessSubnetFormDialog,
  AccessSubnetRow,
} from '@/access-subnets/AccessSubnetFormDialog';
import { translate } from '@/i18n';

import { AccessSubnetScopeFields } from './AccessSubnetScopeFields';

export interface AccessSubnetFormData {
  refetch?(): void;
  customer_url?: string;
  customer_uuid?: string;
  row?: AccessSubnetRow;
}

interface AccessSubnetFormProps {
  resolve: AccessSubnetFormData;
}

export const AccessSubnetForm = ({ resolve }: AccessSubnetFormProps) => (
  <AccessSubnetFormDialog
    refetch={resolve.refetch}
    row={resolve.row}
    config={{
      scopeField: 'customer',
      scopeUrl: resolve.customer_url,
      create: (body) => accessSubnetsCreate({ body: body as any }),
      update: (uuid, body) =>
        accessSubnetsPartialUpdate({ path: { uuid }, body }),
      enforceSingleHost: true,
      placeholder: translate('Example: 192.168.1.5/32'),
      renderExtraFields: ({ values, onChange }) => (
        <AccessSubnetScopeFields
          customerUuid={resolve.customer_uuid}
          appliesToPortal={Boolean(values.applies_to_portal)}
          offerings={values.offerings ?? []}
          onChange={onChange}
        />
      ),
      titleCreate: translate('Add access subnet'),
      titleEdit: translate('Edit access subnet'),
      successCreate: translate('Access subnet has been created.'),
      successUpdate: translate('Access subnet has been updated.'),
      errorCreate: translate('Unable to create access subnet.'),
      errorUpdate: translate('Unable to update access subnet.'),
    }}
  />
);
