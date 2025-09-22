import { OrderFormComponentProps } from '@waldur/marketplace/common/types';
import { BaseDeployPage } from '@waldur/marketplace/deploy/DeployPage';

import { deployOfferingSteps } from './steps';

export const OpenstackTenantOrderForm = (props: OrderFormComponentProps) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
