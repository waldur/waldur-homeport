import { FC } from 'react';
import { customersPartialUpdate } from 'waldur-js-client';

import { MembershipRestrictionFormItems } from '@/core/restrictions';
import { EditFieldProvider } from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useSetCustomer, useUser } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

interface CustomerMembershipRestrictionsPanelProps {
  customer: Customer;
}

export const CustomerMembershipRestrictionsPanel: FC<
  CustomerMembershipRestrictionsPanelProps
> = ({ customer }) => {
  const user = useUser();
  const setCustomer = useSetCustomer();

  const canEdit = hasPermission(user, {
    permission: PermissionEnum.UPDATE_CUSTOMER,
    customerId: customer.uuid,
  });

  const { mutateAsync: updateCustomer } = useManagedMutation({
    mutationFn: (formData: Record<string, any>) =>
      customersPartialUpdate({
        path: { uuid: customer.uuid },
        body: formData,
      }),
    successMessage: translate('Membership restrictions updated successfully.'),
    errorMessage: translate('Failed to update membership restrictions.'),
    onSuccess: (response) => {
      setCustomer(response.data);
    },
    closeModal: false,
  });

  return (
    <div className="p-6">
      <EditFieldProvider scope={customer} callback={updateCustomer}>
        <FormTable hideActions={!canEdit}>
          <MembershipRestrictionFormItems />
        </FormTable>
      </EditFieldProvider>
    </div>
  );
};
