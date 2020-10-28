import { $rootScope } from '@waldur/core/services';

export const refreshResource = () => $rootScope.$broadcast('refreshResource');
