import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';

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
import { ORDER_FORM_ID } from '@/marketplace/details/constants';
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
  const dispatch = useDispatch();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (props.selectedOffering?.name && !hasInitialized.current) {
      dispatch(
        change(ORDER_FORM_ID, 'attributes.name', props.selectedOffering.name),
      );
      hasInitialized.current = true;
    }
  }, [props.selectedOffering?.name, dispatch]);

  return <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />;
};
