import { DropdownButton } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { hidePlanAddButton } from '@waldur/marketplace/common/registry';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';

import { ArchivePlanButton } from './ArchivePlanButton';
import { ClonePlanButton } from './ClonePlanButton';
import { EditPlanDescriptionButton } from './EditPlanDescriptionButton';
import { EditPlanPricesButton } from './EditPlanPricesButton';
import { EditPlanQuotasButton } from './EditPlanQuotasButton';

export const PlanActions = ({ offering, plan, refetch, user }) => (
  <DropdownButton variant="primary" title={translate('Actions')} size="sm">
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
      </>
    )}
    {!hidePlanAddButton(offering.type, offering.plans) &&
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
  </DropdownButton>
);
