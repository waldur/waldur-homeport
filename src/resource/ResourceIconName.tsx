import { FunctionComponent } from 'react';

import { Tooltip } from 'waldur-ui';

import openstackIcon from '@/images/appstore/icon-openstack.png';
import rancherIcon from '@/images/appstore/icon-rancher.png';
import vmwareIcon from '@/images/appstore/icon-vmware.png';

import { formatResourceType, formatDefault } from './utils';

interface ResourceIconProps {
  resource: {
    name?: string;
    uuid?: string;
    resource_type?: string;
  };
}

const ICONS = {
  OpenStack: openstackIcon,
  Rancher: rancherIcon,
  VMware: vmwareIcon,
};

export const ResourceIconName: FunctionComponent<ResourceIconProps> = (
  props,
) => (
  <Tooltip label={formatResourceType(props.resource)}>
    <span>
      <img
        src={ICONS[props.resource.resource_type.split('.')[0]]}
        alt="resource"
        className="me-1"
        width={25}
      />{' '}
      {formatDefault(props.resource.name)}
    </span>
  </Tooltip>
);
