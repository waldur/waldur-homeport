import {
  AdditionalConfigurationStep,
  DetailsOverviewStep,
  FinalConfigurationStep,
  NotesStep,
  PlanStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

export const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,
  PlanStep,
  AdditionalConfigurationStep,
  NotesStep,
  FinalConfigurationStep,
];
