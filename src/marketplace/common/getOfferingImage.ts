import { AZURE_SQL_TYPE, AZURE_VM_TYPE } from '@/azure/constants';
import azureIcon from '@/images/appstore/icon-azure.png';
import openstackIcon from '@/images/appstore/icon-openstack.png';
import rancherIcon from '@/images/appstore/icon-rancher.png';
import vmwareIcon from '@/images/appstore/icon-vmware.png';
import { INSTANCE_TYPE, TENANT_TYPE, VOLUME_TYPE } from '@/openstack/constants';
import { MARKETPLACE_RANCHER } from '@/rancher/cluster/create/constants';
import { VMWARE_VM } from '@/vmware/constants';

import { Offering } from '../types';

export const getOfferingImage = (offering: Offering) => {
  if (offering.image) return offering.image;
  if (offering.thumbnail) return offering.thumbnail;
  switch (offering.type) {
    case INSTANCE_TYPE:
    case VOLUME_TYPE:
    case TENANT_TYPE:
      return openstackIcon;

    case AZURE_SQL_TYPE:
    case AZURE_VM_TYPE:
      return azureIcon;

    case MARKETPLACE_RANCHER:
      return rancherIcon;

    case VMWARE_VM:
      return vmwareIcon;

    default:
      return null;
  }
};
