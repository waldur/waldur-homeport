import { openModalDialog } from '@waldur/modal/actions';

export const showOfferingPlanDescription = planDescription =>
  openModalDialog('MarketplaceOfferingPlanDescription', {resolve: {plan_description: planDescription}, size: 'md'});
