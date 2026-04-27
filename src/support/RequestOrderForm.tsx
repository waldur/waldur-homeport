import { OrderFormComponentProps } from '@/marketplace/common/types';
import { BaseDeployPage } from '@/marketplace/deploy/DeployPage';

import { deployOfferingSteps } from './deploy-steps';

export const RequestOrderForm = (props: OrderFormComponentProps) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
