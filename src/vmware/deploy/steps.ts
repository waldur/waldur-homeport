import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { FormFinalConfigurationStep } from '@waldur/marketplace/deploy/steps/FormFinalConfigurationStep';
import { FormProjectStep } from '@waldur/marketplace/deploy/steps/FormProjectStep';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

import { FormAdvancedOptionsStep } from './FormAdvancedOptionsStep';
import { FormMemoryStep } from './FormMemoryStep';
import { FormNetworkStep } from './FormNetworkStep';
import { FormProcessorStep } from './FormProcessorStep';
import { FormStorageStep } from './FormStorageStep';
import { FormTemplateStep } from './FormTemplateStep';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  {
    label: translate('Project'),
    id: 'step-project',
    fields: ['project'],
    required: true,
    requiredFields: ['project'],
    component: FormProjectStep,
  },
  {
    label: translate('Template'),
    id: 'step-template',
    fields: ['attributes.template'],
    required: true,
    requiredFields: ['attributes.template'],
    component: FormTemplateStep,
  },
  {
    label: translate('Processor'),
    id: 'step-processor',
    fields: ['limits.cpu', 'attributes.cores_per_socket'],
    required: false,
    component: FormProcessorStep,
  },
  {
    label: translate('Memory'),
    id: 'step-memory',
    fields: ['limits.ram'],
    required: false,
    component: FormMemoryStep,
  },
  {
    label: translate('Storage'),
    id: 'step-storage',
    fields: ['limits.disk'],
    required: false,
    component: FormStorageStep,
  },
  {
    label: translate('Network interfaces'),
    id: 'step-networks',
    fields: ['attributes.networks'],
    required: false,
    component: FormNetworkStep,
  },
  {
    label: translate('Advanced options'),
    id: 'step-advanced-options',
    fields: [],
    required: false,
    requiredFields: [],
    component: FormAdvancedOptionsStep,
    isActive: () => !ENV.plugins.WALDUR_VMWARE.BASIC_MODE,
  },
  {
    label: translate('Final configuration'),
    id: 'step-final-configuration',
    fields: ['attributes.name', 'attributes.description'],
    required: true,
    requiredFields: ['attributes.name'],
    component: FormFinalConfigurationStep,
    params: { nameLabel: translate('VM name') },
  },
];
