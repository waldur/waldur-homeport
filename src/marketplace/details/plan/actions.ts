import { openModalDialog } from '@waldur/modal/actions';

export const showOfferingPlanDescription = planDescription =>
  openModalDialog('marketplaceOfferingPlanDescription', {resolve: {plan_description: planDescription}, size: 'md'});

export const showPlanDetailsDialog = resourceId =>
  openModalDialog('marketplacePlanDetailsDialog', {resolve: {resourceId}, size: 'lg'});
