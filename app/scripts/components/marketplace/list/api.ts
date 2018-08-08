import { get } from '@waldur/core/api';
import { Category } from '@waldur/marketplace/types';

export const getCategory = (categoryUuid: string) =>
  get<Category>(`/marketplace-categories/${categoryUuid}/`).then(response => response.data);
