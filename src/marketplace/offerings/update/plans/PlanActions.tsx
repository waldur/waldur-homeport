import { hidePlanAddButton } from '@/marketplace/common/registry';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { offeringOwnsPricing } from '../../utils';

import { ArchivePlanButton } from './ArchivePlanButton';
import { ClonePlanButton } from './ClonePlanButton';
import { DeletePlanButton } from './DeletePlanButton';
import { EditPlanDescriptionButton } from './EditPlanDescriptionButton';
import { EditPlanDiscountsButton } from './EditPlanDiscountsButton';
import { EditPlanPricesButton } from './EditPlanPricesButton';
import { EditPlanQuotasButton } from './EditPlanQuotasButton';
import { UpdateAccessPoliciesAction } from './UpdateAccessPoliciesAction';

export const PlanActions = ({ offering, plan, refetch, user }) => {
  return (
    <ActionsDropdownComponent>
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

          {offeringOwnsPricing(offering) && (
            <>
              <EditPlanPricesButton
                offering={offering}
                refetch={refetch}
                plan={plan}
              />

              <EditPlanDiscountsButton
                offering={offering}
                plan={plan}
                refetch={refetch}
              />

              <EditPlanQuotasButton
                offering={offering}
                refetch={refetch}
                plan={plan}
              />
            </>
          )}

          <UpdateAccessPoliciesAction plan={plan} refetch={refetch} />
        </>
      )}
      {offeringOwnsPricing(offering) &&
        !hidePlanAddButton(offering.type, offering.plans) &&
        hasPermission(user, {
          permission: PermissionEnum.CREATE_OFFERING_PLAN,
          customerId: offering.customer_uuid,
        }) && (
          <ClonePlanButton offering={offering} refetch={refetch} plan={plan} />
        )}
      {hasPermission(user, {
        permission: PermissionEnum.ARCHIVE_OFFERING_PLAN,
        customerId: offering.customer_uuid,
      }) && <ArchivePlanButton refetch={refetch} plan={plan} />}
      {user.is_staff && <DeletePlanButton refetch={refetch} plan={plan} />}
    </ActionsDropdownComponent>
  );
};
