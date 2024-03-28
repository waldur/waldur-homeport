import { BaseDeployPage } from '@waldur/marketplace/deploy/DeployPage';

import { deployOfferingSteps } from './steps';

export const OpenstackTenantOrder = (props) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
