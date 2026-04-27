import { useSelector } from 'react-redux';

import { getUser } from '@/workspace/selectors';

import { hasPermission } from './hasPermission';
import { PermissionRequest } from './types';

export const usePermission = () => {
  const user = useSelector(getUser);
  return (request: PermissionRequest) => hasPermission(user, request);
};
