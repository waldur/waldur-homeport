import { useUser } from '@/workspace/hooks';

import { hasPermission } from './hasPermission';
import { PermissionRequest } from './types';

export const usePermission = () => {
  const user = useUser();
  return (request: PermissionRequest) => hasPermission(user, request);
};
