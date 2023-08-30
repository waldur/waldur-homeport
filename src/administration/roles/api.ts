import { deleteById, post, put } from '@waldur/core/api';

export const createRole = (payload) => post('/roles/', payload);

export const deleteRole = (uuid: string) => deleteById('/roles/', uuid);

export const editRole = (uuid, formData) => put(`/roles/${uuid}/`, formData);
