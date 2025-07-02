import { AzureProviderConfig } from '@waldur/azure/provider/provider';
import { getProviderType } from '@waldur/marketplace/common/registry';
import { OpenStackProviderConfig } from '@waldur/openstack/provider';
import { RancherProviderConfig } from '@waldur/rancher/provider';
import { SlurmProviderConfig } from '@waldur/slurm/provider';
import { VMwareProviderConfig } from '@waldur/vmware/provider';

import { ProviderConfig } from './types';

const providers: { [key: string]: ProviderConfig } = {};

const register = (provider: ProviderConfig) => {
  providers[provider.type] = provider;
};

const findProvider = (type) => providers[type];

export const getTypeDisplay = (type) =>
  providers[type] ? providers[type].name : type;

export const getServiceIcon = (type) => providers[type].icon;

export const getServiceSettingsForm = (type) => {
  const providerType = getProviderType(type);
  if (providerType) {
    const providerConfig = findProvider(providerType);
    return providerConfig.component;
  }
};

register(AzureProviderConfig);
register(OpenStackProviderConfig);
register(RancherProviderConfig);
register(SlurmProviderConfig);
register(VMwareProviderConfig);
