import { OrderFormComponentProps } from '@waldur/marketplace/common/types';
import { BaseDeployPage } from '@waldur/marketplace/deploy/DeployPage';

import { managedDeployOfferingSteps } from './managed-steps';
import { deployOfferingSteps } from './steps';

export const RancherOrderForm = (props: OrderFormComponentProps) => {
  const steps =
    props.offering.plugin_options?.deployment_mode == 'self_managed'
      ? deployOfferingSteps
      : managedDeployOfferingSteps;
  return <BaseDeployPage inputFormSteps={steps} {...props} />;
};
