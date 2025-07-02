import { BaseDeployPage } from '@waldur/marketplace/deploy/DeployPage';

import { managedDeployOfferingSteps } from './managed-steps';

export const ManagedRancherOrderForm = (props) => (
  <BaseDeployPage inputFormSteps={managedDeployOfferingSteps} {...props} />
);
