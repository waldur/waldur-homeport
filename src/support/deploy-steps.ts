import {
  AdditionalConfigurationStep,
  DetailsOverviewStep,
  FinalConfigurationStep,
  PlanStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,
  PlanStep,
  AdditionalConfigurationStep,
  FinalConfigurationStep,
];
