import { $http } from '@waldur/core/services';

export const removeHook = (url: string) => $http.delete(url);
