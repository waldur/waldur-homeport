import { BaseDeployPage } from '@waldur/marketplace/deploy/DeployPage';
import {
  AdditionalConfigurationStep,
  DetailsOverviewStep,
  FinalConfigurationStep,
  PlanStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,
  PlanStep,
  AdditionalConfigurationStep,
  FinalConfigurationStep,
];

export const SiteAgentOrderForm = (props) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
