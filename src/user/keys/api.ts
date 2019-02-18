import { deleteById } from '@waldur/core/api';

export const removeKey = (id: string) => deleteById('/keys/', id);
