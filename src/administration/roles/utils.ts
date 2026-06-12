import { rolesList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';

export const getRoles = (options?: Parameters<typeof rolesList>[0]) =>
  getAllPages((page) => rolesList({ query: { page }, ...options }));
