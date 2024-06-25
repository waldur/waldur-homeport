import { translate } from '@waldur/i18n';

import { FormCustomerStep } from './FormCustomerStep';
import { FormPlanStep } from './FormPlanStep';
import { FormProjectStep } from './FormProjectStep';

export const ProjectStep = {
  label: translate('Project'),
  id: 'step-project',
  fields: ['project'],
  required: true,
  requiredFields: ['project'],
  component: FormProjectStep,
  isActive: (offering) => offering.shared,
};

export const CustomerStep = {
  label: translate('Customer'),
  id: 'step-customer',
  fields: ['customer'],
  required: true,
  requiredFields: ['customer'],
  component: FormCustomerStep,
  isActive: (offering) => offering.shared,
};

export const PlanStep = {
  label: translate('Plan'),
  id: 'step-plan',
  fields: ['plan'],
  required: true,
  requiredFields: ['plan'],
  component: FormPlanStep,
};
