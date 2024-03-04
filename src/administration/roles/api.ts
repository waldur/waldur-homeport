import { deleteById, getAll, post, put } from '@waldur/core/api';
import { Role } from '@waldur/permissions/types';

export const createRole = (payload) => post('/roles/', payload);

export const deleteRole = (uuid: string) => deleteById('/roles/', uuid);

export const editRole = (uuid, formData) => put(`/roles/${uuid}/`, formData);

export const getRoles = () => getAll<Role>('/roles/');

export const enableRole = (uuid) => post(`/roles/${uuid}/enable/`);

export const disableRole = (uuid) => post(`/roles/${uuid}/disable/`);
