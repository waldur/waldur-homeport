import { $http } from '@waldur/core/services';

export const fetchResource = url => $http.get(url);
