import { ENV } from '@waldur/configs/default';
import { deleteById, get, getAll, getById, post, put } from '@waldur/core/api';

import { VMwareTemplate } from './types';

export const getVMwareLimits = (settingsId) =>
  getById<Record<string, number>>('/vmware-limits/', settingsId);

export const getVMwareTemplates = (
  settings_uuid: string,
  customer_uuid: string,
) =>
  getAll<VMwareTemplate>('/vmware-templates/', {
    params: { settings_uuid, customer_uuid },
  });

export const loadVMwareTemplatesAndLimits = async (props: {
  settings_uuid: string;
  customer_uuid: string;
}) => {
  const [templates, limits] = await Promise.all([
    getVMwareTemplates(props.settings_uuid, props.customer_uuid),
    getVMwareLimits(props.settings_uuid),
  ]);
  return { templates, limits };
};

export const getVMwareNetworks = (
  settings_uuid: string,
  customer_uuid: string,
) =>
  getAll('/vmware-networks/', {
    params: { settings_uuid, customer_uuid },
  });

export const loadVMwareAdvancedOptions = async (props: {
  settings_uuid: string;
  customer_uuid: string;
}) => {
  const options = {
    params: {
      settings_uuid: props.settings_uuid,
      customer_uuid: props.customer_uuid,
    },
  };
  const [clusters, datastores, folders] = await Promise.all([
    getAll('/vmware-clusters/', options),
    getAll('/vmware-datastores/', options),
    getAll('/vmware-folders/', options),
  ]);
  return {
    clusters,
    datastores,
    folders,
  };
};

export const loadFormOptions = async (props: {
  settings_uuid: string;
  customer_uuid: string;
}) => {
  const advancedMode = !ENV.plugins.WALDUR_VMWARE.BASIC_MODE;
  if (advancedMode) {
    const [templatesAndLimits, networks, advancedOptions] = await Promise.all([
      loadVMwareTemplatesAndLimits(props),
      getVMwareNetworks(props.settings_uuid, props.customer_uuid),
      loadVMwareAdvancedOptions(props),
    ]);
    return { ...templatesAndLimits, ...advancedOptions, networks };
  } else {
    return await loadVMwareTemplatesAndLimits(props);
  }
};

export interface CreatePortRequestBody {
  name: string;
  network: string;
}

export const createDisk = (id: string, size: number) =>
  post(`/vmware-virtual-machine/${id}/create_disk/`, { size });

export const createPort = (id: string, data: CreatePortRequestBody) =>
  post(`/vmware-virtual-machine/${id}/create_port/`, data);

export const pullPort = (id: string) => post(`/vmware-ports/${id}/pull/`);

export const pullDisk = (id: string) => post(`/vmware-disks/${id}/pull/`);

export const extendDisk = (id: string, size: number) =>
  post(`/vmware-disks/${id}/extend/`, { size });

export const pullVirtualMachine = (id: string) =>
  post(`/vmware-virtual-machine/${id}/pull/`);

export const updateVirtualMachine = (id: string, data) =>
  put(`/vmware-virtual-machine/${id}/`, data);

export const startVirtualMachine = (id: string) =>
  post(`/vmware-virtual-machine/${id}/start/`);

export const stopVirtualMachine = (id: string) =>
  post(`/vmware-virtual-machine/${id}/stop/`);

export const resetVirtualMachine = (id: string) =>
  post(`/vmware-virtual-machine/${id}/reset/`);

export const suspendVirtualMachine = (id: string) =>
  post(`/vmware-virtual-machine/${id}/suspend/`);

export const shutdownVirtualMachine = (id: string) =>
  post(`/vmware-virtual-machine/${id}/shutdown_guest/`);

export const rebootVirtualMachine = (id: string) =>
  post(`/vmware-virtual-machine/${id}/reboot_guest/`);

export const getVirtualMachineConsoleUrl = (id: string) =>
  get<{ url: string }>(`/vmware-virtual-machine/${id}/console/`).then(
    (response) => response.data.url,
  );

export const destroyVirtualMachine = (id: string) =>
  deleteById('/vmware-virtual-machine/', id);
