import { getLatinNameValidators } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { OrderFormComponentProps } from '@waldur/marketplace/common/types';
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
  {
    ...FinalConfigurationStep,
    params: {
      nameLabel: translate('Allocation name'),
      nameValidate: getLatinNameValidators(),
    },
  },
];

export const SlurmOrderForm = (props: OrderFormComponentProps) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
