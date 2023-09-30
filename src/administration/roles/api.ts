import { getAll, deleteById, post, put } from '@waldur/core/api';
import { Role } from '@waldur/permissions/types';

export const createRole = (payload) => post('/roles/', payload);

export const deleteRole = (uuid: string) => deleteById('/roles/', uuid);

export const editRole = (uuid, formData) => put(`/roles/${uuid}/`, formData);

export const getRoles = () => getAll<Role>('/roles/');
