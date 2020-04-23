import Axios from 'axios';
import FileSaver from 'file-saver';

export const downloadFile = (url: string, filename: string): Promise<void> =>
  Axios.request({
    url,
    method: 'GET',
    responseType: 'blob',
  }).then(response => {
    FileSaver.saveAs(response.data, filename);
  });
