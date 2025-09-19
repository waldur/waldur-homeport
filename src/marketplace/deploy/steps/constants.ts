import { translate } from '@waldur/i18n';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { Offering } from '@waldur/marketplace/types';

import { FormAdditionalConfigurationStep } from './FormAdditionalConfigurationStep';
import { FormDetailsOverviewStep } from './FormDetailsOverviewStep';
import { FormNotesStep } from './FormNotesStep';
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

export const NotesStep = {
  label: translate('Notes and attachments'),
  id: 'step-notes',
  fields: ['request_comment', 'attachment'],
  required: false,
  component: FormNotesStep,
  isActive: (offering: Offering) => {
    return (
      offering?.plugin_options?.order_supports_comments_and_metadata ?? false
    );
  },
};

export const FinalConfigurationStep = {
  label: translate('Final configuration'),
  id: 'step-final-configuration',
  fields: ['attributes.name', 'attributes.description', 'attributes.end_date'],
  required: true,
  requiredFields: ['attributes.name'],
  component: FormFinalConfigurationStep,
};
