import { FileArrowDown } from '@phosphor-icons/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { showErrorResponse } from '@waldur/store/notify';

export const FileDownloader = ({ url, name }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);

    get<Blob>(url, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));

        const link = document.createElement('a');
        link.setAttribute('download', name);
        link.href = url;

        document.body.appendChild(link);

        // Trigger the download by simulating a click
        link.click();

        // Clean up by removing the link
        link.parentNode.removeChild(link);
      })
      .catch((error) => {
        dispatch(showErrorResponse(error, translate('File download failed')));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <button onClick={handleDownload} disabled={loading}>
      {loading ? <LoadingSpinner /> : <FileArrowDown />}
    </button>
  );
};
