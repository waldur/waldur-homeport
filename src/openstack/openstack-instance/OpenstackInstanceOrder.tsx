import { BaseDeployPage } from '@waldur/marketplace/deploy/DeployPage';

import { deployOfferingSteps } from './deploy/steps';

export const OpenstackInstanceOrder = (props) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
