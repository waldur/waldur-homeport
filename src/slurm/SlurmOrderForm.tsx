import { getLatinNameValidators } from '@/core/validators';
import { translate } from '@/i18n';
import { OrderFormComponentProps } from '@/marketplace/common/types';
import { BaseDeployPage } from '@/marketplace/deploy/DeployPage';
import {
  AdditionalConfigurationStep,
  DetailsOverviewStep,
  FinalConfigurationStep,
  PlanStep,
} from '@/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@/marketplace/deploy/types';

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
