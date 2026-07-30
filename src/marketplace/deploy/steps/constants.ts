import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { FormFinalConfigurationStep } from '@/marketplace/deploy/steps/FormFinalConfigurationStep';

import { FormAdditionalConfigurationStep } from './FormAdditionalConfigurationStep';
import { FormDetailsOverviewStep } from './FormDetailsOverviewStep';
import { FormPlanStep } from './FormPlanStep';
import { FormQoSSelectionStep } from './FormQoSSelectionStep';

export const DetailsOverviewStep = {
  label: translate('General information'),
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
    return offering.options?.order?.length > 0;
  },
};

export const QoSSelectionStep = {
  label: translate('Partition & QoS'),
  id: 'step-qos-selection',
  fields: ['attributes.partition', 'attributes.qos'],
  required: false,
  requiredFields: [],
  component: FormQoSSelectionStep,
  // Show only when the partitions/QoS feature is enabled AND the offering
  // actually has QoS profiles to pick — an empty QoS catalog means nothing to
  // select, so the step stays hidden even if partitions exist.
  isActive: (offering) =>
    isFeatureVisible(MarketplaceFeatures.display_offering_partitions) &&
    offering.qos_profiles?.length > 0,
};

export const FinalConfigurationStep = {
  label: translate('Final configuration'),
  id: 'step-final-configuration',
  fields: ['attributes.name', 'attributes.description', 'attributes.end_date'],
  required: true,
  requiredFields: ['attributes.name'],
  component: FormFinalConfigurationStep,
};
