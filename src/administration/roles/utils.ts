import { Options, rolesList, RolesListData } from 'waldur-js-client';

import { getAllPages } from '@/core/api';

export const getRoles = (options?: Options<RolesListData>) =>
  getAllPages((page) => rolesList({ query: { page }, ...options }));
