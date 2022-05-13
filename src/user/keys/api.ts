import { deleteById, post } from '@waldur/core/api';

import { KeyPair } from '../types';

export const removeKey = (id: string) => deleteById('/keys/', id);
export const createKey = (data) => post<KeyPair>('/keys/', data);
