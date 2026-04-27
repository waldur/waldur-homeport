import { OrderFormComponentProps } from '@/marketplace/common/types';
import { BaseDeployPage } from '@/marketplace/deploy/DeployPage';

import { deployOfferingSteps } from './deploy/steps';

export const AzureVirtualMachineForm = (props: OrderFormComponentProps) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
