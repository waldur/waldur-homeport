import { OrderFormComponentProps } from '@/marketplace/common/types';
import { BaseDeployPage } from '@/marketplace/deploy/DeployPage';

import { deployOfferingSteps } from './steps';

export const VmwareOrderForm = (props: OrderFormComponentProps) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
