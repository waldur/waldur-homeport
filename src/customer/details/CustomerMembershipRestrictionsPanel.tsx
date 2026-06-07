import { FC, useCallback, useMemo } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import {
  getRestrictionsArray,
  MembershipRestrictionFormItems,
  RestrictionField,
} from '@/core/restrictions';
import FormTable from '@/form/FormTable';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import { getInitialValues } from './restrictions/EditMembershipRestrictionsDialog.helpers';

interface CustomerMembershipRestrictionsPanelProps {
  customer: Customer;
}

const EditMembershipRestrictionsDialog = lazyComponent(() =>
  import('./restrictions/EditMembershipRestrictionsDialog').then((module) => ({
    default: module.EditMembershipRestrictionsDialog,
  })),
);

export const CustomerMembershipRestrictionsPanel: FC<
  CustomerMembershipRestrictionsPanelProps
> = ({ customer }) => {
  const { openDialog } = useModal();
  const user = useUser();

  const canEdit = hasPermission(user, {
    permission: PermissionEnum.UPDATE_CUSTOMER,
    customerId: customer.uuid,
  });

  const restrictionData = useMemo(
    () => ({
      emailPatterns: getRestrictionsArray(customer.user_email_patterns),
      affiliations: getRestrictionsArray(customer.user_affiliations),
      identitySources: getRestrictionsArray(customer.user_identity_sources),
      nationalities: getRestrictionsArray(customer['user_nationalities']),
      organizationTypes: getRestrictionsArray(
        customer['user_organization_types'],
      ),
      assuranceLevels: getRestrictionsArray(customer['user_assurance_levels']),
    }),
    [customer],
  );

  const openEditDialog = useCallback(
    (field: RestrictionField) => {
      openDialog(EditMembershipRestrictionsDialog, {
        resolve: { customer, field },
        initialValues: getInitialValues(customer, field),
      });
    },
    [customer],
  );

  return (
    <div className="p-6">
      <FormTable>
        <MembershipRestrictionFormItems
          data={restrictionData}
          canEdit={canEdit}
          onEditField={openEditDialog}
        />
      </FormTable>
    </div>
  );
};
