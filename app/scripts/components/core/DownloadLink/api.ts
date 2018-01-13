import FileSaver from 'file-saver';

import { $http } from '@waldur/core/services';

export const downloadFile = (url: string, filename: string): angular.IPromise<void> =>
  $http({
    url,
    method: 'GET',
    responseType: 'blob',
  }).then(response => {
    FileSaver.saveAs(response.data, filename);
  });
