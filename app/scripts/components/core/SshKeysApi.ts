import {$http, ENV} from '@waldur/core/services';

export const findPublicKeyByUuid = (uuid: string) =>
  $http.get(`${ENV.apiEndpoint}api/keys/${uuid}/`).then(response => response.data);
