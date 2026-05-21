import { useEffect, useRef } from 'react';
import { useForm } from 'react-final-form';

import { getLatinNameValidators } from '@/core/validators';
import { translate } from '@/i18n';
import { OrderFormComponentProps } from '@/marketplace/common/types';
import { BaseDeployPage } from '@/marketplace/deploy/DeployPage';
import {
  AdditionalConfigurationStep,
  DetailsOverviewStep,
  PlanStep,
} from '@/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@/marketplace/deploy/types';
import { FinalConfigurationStep } from '@/openportal/constants';

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

export const OpenPortalOrderForm = (props: OrderFormComponentProps) => {
  const form = useForm();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (props.selectedOffering?.name && !hasInitialized.current) {
      form.change('attributes.name', props.selectedOffering.name);
      hasInitialized.current = true;
    }
  }, [props.selectedOffering?.name, form]);

  return <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />;
};
