import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import azureIcon from '@waldur/images/appstore/icon-azure.png';
import openstackIcon from '@waldur/images/appstore/icon-openstack.png';
import rancherIcon from '@waldur/images/appstore/icon-rancher.png';
import slurmIcon from '@waldur/images/appstore/icon-slurm.png';
import vmwareIcon from '@waldur/images/appstore/icon-vmware.png';

import { formatResourceType, formatDefault } from './utils';

interface ResourceIconProps {
  resource: {
    name?: string;
    uuid?: string;
    resource_type?: string;
  };
}

const ICONS = {
  Azure: azureIcon,
  OpenStack: openstackIcon,
  Rancher: rancherIcon,
  SLURM: slurmIcon,
  VMware: vmwareIcon,
};

export const ResourceIconName: FunctionComponent<ResourceIconProps> = (
  props,
) => (
  <Tip
    id={`resourceIcon-${props.resource.uuid}`}
    label={formatResourceType(props.resource)}
  >
    <img
      src={ICONS[props.resource.resource_type.split('.')[0]]}
      alt="resource"
      className="me-1"
      width={25}
    />{' '}
    {formatDefault(props.resource.name)}
  </Tip>
);
