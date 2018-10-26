import { IPromise } from 'angular';
import FileSaver from 'file-saver';

import { $http } from '@waldur/core/services';

export const downloadFile = (url: string, filename: string): IPromise<void> =>
  $http({
    url,
    method: 'GET',
    responseType: 'blob',
  }).then(response => {
    FileSaver.saveAs(response.data, filename);
  });
