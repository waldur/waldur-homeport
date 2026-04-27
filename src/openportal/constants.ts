import { translate } from '@/i18n';
import { FormFinalConfigurationStep } from '@/marketplace/deploy/steps/FormFinalConfigurationStep';

export const OPENPORTAL_PLUGIN = 'Marketplace.OpenPortal';

export const PROJECT_TEMPLATE_FIELD_CONSTRAINTS = {
  MAX_PORTALIDENTIFIER_LENGTH: 32,
  MAX_PROJECTCLASS_LENGTH: 128,
  MAX_PROJECT_SHORTNAME_LENGTH: 30,
  MAX_OFFERING_LENGTH: 128,
  MAX_KEY_LENGTH: 64,
} as const;

export const FinalConfigurationStep = {
  label: translate('Final configuration'),
  id: 'step-final-configuration',
  fields: ['attributes.name', 'attributes.description', 'attributes.end_date'],
  required: true,
  requiredFields: ['attributes.name'],
  component: FormFinalConfigurationStep,
};
