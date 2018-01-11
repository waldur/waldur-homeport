import FileSaver from 'file-saver';

import { $http } from '@waldur/core/services';

export const downloadFile = async (url: string, filename: string): Promise<void> => {
  const response = await $http({
    url,
    method: 'GET',
    responseType: 'blob',
  });
  FileSaver.saveAs(response.data, filename);
};
