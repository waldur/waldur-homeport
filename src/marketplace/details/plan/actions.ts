import { openModalDialog } from '@waldur/modal/actions';

import { PlanDescription } from './PlanDescription';
import { PlanDetailsDialog } from './PlanDetailsDialog';

export const showOfferingPlanDescription = planDescription =>
  openModalDialog(PlanDescription, {
    resolve: { plan_description: planDescription },
    size: 'md',
  });

export const showPlanDetailsDialog = resourceId =>
  openModalDialog(PlanDetailsDialog, {
    resolve: { resourceId },
    size: 'lg',
  });
