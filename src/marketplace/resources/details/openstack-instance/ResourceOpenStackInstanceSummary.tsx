import { ResourceFlavorField } from './ResourceFlavorField';
import { ResourceFloatingIpField } from './ResourceFloatingIpField';
import { ResourceImageField } from './ResourceImageField';
import { ResourceInternalIpsField } from './ResourceInternalIpsField';

export const ResourceOpenStackInstanceSummary = ({ scope }) => (
  <>
    <ResourceImageField scope={scope} />
    <ResourceFlavorField scope={scope} />
    <ResourceInternalIpsField scope={scope} />
    <ResourceFloatingIpField scope={scope} />
  </>
);
