import { OrderFormComponentProps } from '@waldur/marketplace/common/types';
import { BaseDeployPage } from '@waldur/marketplace/deploy/DeployPage';

import { deployOfferingSteps } from './steps';

export const OpenstackVolumeOrder = (props: OrderFormComponentProps) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
