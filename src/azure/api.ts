import { deleteById, post } from '@waldur/core/api';

export const createDatabase = (id, data) =>
  post(`/azure-sql-servers/${id}/create_database/`, data);

export const destoryDatabaseServer = (id: string) =>
  deleteById('/azure-sql-servers/', id);
