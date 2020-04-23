import Axios from 'axios';

import { ENV } from '@waldur/core/services';

export const findPublicKeyByUuid = (uuid: string) =>
  Axios.get(`${ENV.apiEndpoint}api/keys/${uuid}/`).then(
    response => response.data,
  );
