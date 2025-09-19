import { getLatinNameValidators } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { BaseDeployPage } from '@waldur/marketplace/deploy/DeployPage';
import {
  AdditionalConfigurationStep,
  DetailsOverviewStep,
  FinalConfigurationStep,
  NotesStep,
  PlanStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';

const deployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,
  PlanStep,
  AdditionalConfigurationStep,
  NotesStep,
  {
    ...FinalConfigurationStep,
    params: {
      nameLabel: translate('Allocation name'),
      nameValidate: getLatinNameValidators(),
    },
  },
];

export const SlurmOrderForm = (props) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
