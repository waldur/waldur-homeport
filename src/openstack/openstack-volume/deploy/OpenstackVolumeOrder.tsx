import { BaseDeployPage } from '@waldur/marketplace/deploy/DeployPage';

import { deployOfferingSteps } from './steps';

export const OpenstackVolumeOrder = (props) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
