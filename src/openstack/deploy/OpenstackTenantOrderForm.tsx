import { BaseDeployPage } from '@waldur/marketplace/deploy/DeployPage';

import { deployOfferingSteps } from './steps';

export const OpenstackTenantOrderForm = (props) => (
  <BaseDeployPage inputFormSteps={deployOfferingSteps} {...props} />
);
