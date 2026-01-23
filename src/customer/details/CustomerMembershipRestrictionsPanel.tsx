import { FC, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import {
  getRestrictionsArray,
  MembershipRestrictionFormItems,
  RestrictionField,
} from '@waldur/core/restrictions';
import FormTable from '@waldur/form/FormTable';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { getInitialValues } from './restrictions/EditMembershipRestrictionsDialog';

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
  const dispatch = useDispatch();
  const user = useSelector(getUser);

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
      dispatch(
        openModalDialog(EditMembershipRestrictionsDialog, {
          resolve: { customer, field },
          initialValues: getInitialValues(customer, field),
        }),
      );
    },
    [dispatch, customer],
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
