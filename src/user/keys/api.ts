import { deleteById } from '@waldur/core/api';
import { post } from '@waldur/core/api';

export const removeKey = (id: string) => deleteById('/keys/', id);
export const createKey = data => post('/keys/', data);
