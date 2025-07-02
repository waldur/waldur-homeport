import azureIcon from '@waldur/images/appstore/icon-azure.png';
import openstackIcon from '@waldur/images/appstore/icon-openstack.png';
import rancherIcon from '@waldur/images/appstore/icon-rancher.png';
import slurmIcon from '@waldur/images/appstore/icon-slurm.png';
import vmwareIcon from '@waldur/images/appstore/icon-vmware.png';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import { MARKETPLACE_RANCHER } from '@waldur/rancher/cluster/create/constants';
import { SLURM_PLUGIN, SITE_AGENT_PLUGIN } from '@waldur/slurm/constants';
import { VMWARE_VM } from '@waldur/vmware/constants';

import { Offering } from '../types';

export const getOfferingImage = (offering: Offering) => {
  if (offering.image) return offering.image;
  if (offering.thumbnail) return offering.thumbnail;
  switch (offering.type) {
    case INSTANCE_TYPE:
    case VOLUME_TYPE:
    case TENANT_TYPE:
      return openstackIcon;

    case 'Azure.SQLServer':
    case 'Azure.VirtualMachine':
      return azureIcon;

    case MARKETPLACE_RANCHER:
      return rancherIcon;

    case SLURM_PLUGIN:
    case SITE_AGENT_PLUGIN:
      return slurmIcon;

    case VMWARE_VM:
      return vmwareIcon;

    default:
      return null;
  }
};
