import {
  AdditionalConfigurationStep,
  DetailsOverviewStep,
  FinalConfigurationStep,
  PlanStep,
} from '@/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@/marketplace/deploy/types';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,
  PlanStep,
  AdditionalConfigurationStep,
  FinalConfigurationStep,
];
