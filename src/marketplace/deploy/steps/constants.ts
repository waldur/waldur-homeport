import { translate } from '@waldur/i18n';

import { FormAdditionalConfigurationStep } from './FormAdditionalConfigurationStep';
import { FormDetailsOverviewStep } from './FormDetailsOverviewStep';
import { FormPlanStep } from './FormPlanStep';

export const DetailsOverviewStep = {
  label: translate('Details overview'),
  id: 'step-general',
  fields: ['customer', 'project'],
  required: true,
  requiredFields: ['customer', 'project'],
  component: FormDetailsOverviewStep,
};

export const PlanStep = {
  label: translate('Plan'),
  id: 'step-plan',
  // plan_entries is not a field, it's is for identifying server-side errors related to plan entries.
  fields: ['plan', 'plan_entries'],
  required: true,
  requiredFields: ['plan'],
  component: FormPlanStep,
};

export const AdditionalConfigurationStep = {
  label: translate('Additional configuration'),
  id: 'step-additional-configuration',
  required: false,
  component: FormAdditionalConfigurationStep,
  isActive: (offering) => {
    return offering.options.order?.length > 0;
  },
};
