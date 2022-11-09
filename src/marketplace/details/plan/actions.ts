import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const PlanDescription = lazyComponent(
  () => import('./PlanDescription'),
  'PlanDescription',
);
const PlanDetailsDialog = lazyComponent(
  () => import('./PlanDetailsDialog'),
  'PlanDetailsDialog',
);

export const showOfferingPlanDescription = (planDescription) =>
  openModalDialog(PlanDescription, {
    resolve: { plan_description: planDescription },
    size: 'lg',
  });

export const showPlanDetailsDialog = (resourceId) =>
  openModalDialog(PlanDetailsDialog, {
    resolve: { resourceId },
    size: 'lg',
  });
