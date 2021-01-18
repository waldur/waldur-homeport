import { ENV } from '@waldur/configs/default';
import { deleteById, get, getAll, getById, post, put } from '@waldur/core/api';

const getLimits = (settingsId) => getById('/vmware-limits/', settingsId);

export const loadFormOptions = async (props: {
  settings_uuid: string;
  customer_uuid: string;
}) => {
  const advancedMode = !ENV.plugins.WALDUR_VMWARE.BASIC_MODE;

  const options = {
    params: {
      settings_uuid: props.settings_uuid,
      customer_uuid: props.customer_uuid,
    },
  };

  if (advancedMode) {
    const [
      templates,
      clusters,
      datastores,
      networks,
      folders,
      limits,
    ] = await Promise.all([
      getAll('/vmware-templates/', options),
      getAll('/vmware-clusters/', options),
      getAll('/vmware-datastores/', options),
      getAll('/vmware-networks/', options),
      getAll('/vmware-folders/', options),
      getLimits(props.settings_uuid),
    ]);

    return {
      templates,
      clusters,
      datastores,
      networks,
      folders,
      limits,
    };
  } else {
    const [templates, limits] = await Promise.all([
      getAll('/vmware-templates/', options),
      getLimits(props.settings_uuid),
    ]);
    return {
      templates,
      limits,
    };
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
