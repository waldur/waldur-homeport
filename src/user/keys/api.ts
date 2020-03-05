import { deleteById, post } from '@waldur/core/api';

export const removeKey = (id: string) => deleteById('/keys/', id);
export const createKey = data => post('/keys/', data);
