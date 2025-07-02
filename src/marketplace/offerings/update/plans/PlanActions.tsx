import { Dropdown } from 'react-bootstrap';

import { hidePlanAddButton } from '@waldur/marketplace/common/registry';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { TableDropdownToggle } from '@waldur/table/ActionsDropdown';

import { ArchivePlanButton } from './ArchivePlanButton';
import { ClonePlanButton } from './ClonePlanButton';
import { EditPlanDescriptionButton } from './EditPlanDescriptionButton';
import { EditPlanPricesButton } from './EditPlanPricesButton';
import { EditPlanQuotasButton } from './EditPlanQuotasButton';
import { UpdateAccessPoliciesAction } from './UpdateAccessPoliciesAction';

export const PlanActions = ({ offering, plan, refetch, user }) => {
  return (
    <Dropdown>
      <TableDropdownToggle />
      <Dropdown.Menu>
        {hasPermission(user, {
          permission: PermissionEnum.UPDATE_OFFERING_PLAN,
          customerId: offering.customer_uuid,
        }) && (
          <>
            <EditPlanDescriptionButton
              offering={offering}
              refetch={refetch}
              plan={plan}
            />

            <EditPlanPricesButton
              offering={offering}
              refetch={refetch}
              plan={plan}
            />

            <EditPlanQuotasButton
              offering={offering}
              refetch={refetch}
              plan={plan}
            />

            <UpdateAccessPoliciesAction plan={plan} refetch={refetch} />
          </>
        )}
        {!hidePlanAddButton(offering.type, offering.plans) &&
          hasPermission(user, {
            permission: PermissionEnum.CREATE_OFFERING_PLAN,
            customerId: offering.customer_uuid,
          }) && (
            <ClonePlanButton
              offering={offering}
              refetch={refetch}
              plan={plan}
            />
          )}
        {hasPermission(user, {
          permission: PermissionEnum.ARCHIVE_OFFERING_PLAN,
          customerId: offering.customer_uuid,
        }) && <ArchivePlanButton refetch={refetch} plan={plan} />}
      </Dropdown.Menu>
    </Dropdown>
  );
};
