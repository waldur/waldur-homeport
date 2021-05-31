import { deleteById, post } from '@waldur/core/api';

export const createDatabase = (id, data) =>
  post(`/azure-sql-servers/${id}/create_database/`, data);

export const destoryDatabaseServer = (id: string) =>
  deleteById('/azure-sql-servers/', id);

export const pullVirtualMachine = (id: string) =>
  post(`/azure-virtualmachines/${id}/pull/`);

export const startVirtualMachine = (id: string) =>
  post(`/azure-virtualmachines/${id}/start/`);

export const restartVirtualMachine = (id: string) =>
  post(`/azure-virtualmachines/${id}/restart/`);

export const stopVirtualMachine = (id: string) =>
  post(`/azure-virtualmachines/${id}/stop/`);

export const destroyVirtualMachine = (id: string) =>
  deleteById('/azure-virtualmachines/', id);
