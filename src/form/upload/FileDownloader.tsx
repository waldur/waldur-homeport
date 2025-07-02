import { FileArrowDownIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useNotify } from '@waldur/store/hooks';

export const FileDownloader = ({ url, name, size = 20 }) => {
  const { showErrorResponse } = useNotify();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      const blob = await get<Blob>(url);
      const href = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.setAttribute('download', name);
      link.href = href;

      document.body.appendChild(link);

      // Trigger the download by simulating a click
      link.click();

      // Clean up by removing the link
      link.parentNode.removeChild(link);
    } catch (error) {
      showErrorResponse(error, translate('File download failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`text-btn text-hover-primary w-${size}px`}
      onClick={handleDownload}
      disabled={loading}
      title={translate('Download')}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <FileArrowDownIcon weight="bold" size={size} />
      )}
    </button>
  );
};
