import { FileArrowDownIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { get } from '@/core/api';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

export const downloadFile = async (url: string, name: string) => {
  const blob = await get<Blob>(url);
  const href = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('download', name);
  link.href = href;
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(href);
};

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
