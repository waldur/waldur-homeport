import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { getLatinNameValidators } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { OrderFormComponentProps } from '@waldur/marketplace/common/types';
import { BaseDeployPage } from '@waldur/marketplace/deploy/DeployPage';
import {
  AdditionalConfigurationStep,
  DetailsOverviewStep,
  PlanStep,
} from '@waldur/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@waldur/marketplace/deploy/types';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';
import { FinalConfigurationStep } from '@waldur/openportal/constants';

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

export const OpenPortalRemoteOrderForm = (props: OrderFormComponentProps) => {
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
