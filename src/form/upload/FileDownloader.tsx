import { FileArrowDownIcon } from '@phosphor-icons/react';
import { ReactNode, useState } from 'react';

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

interface FileDownloaderProps {
  url: string;
  name: string;
  size?: number;
  children?: ReactNode;
  className?: string;
}

export const FileDownloader = ({
  url,
  name,
  size = 20,
  children,
  className,
}: FileDownloaderProps) => {
  const { showErrorResponse } = useNotify();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      await downloadFile(url, name);
    } catch (error) {
      showErrorResponse(error, translate('File download failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={
        className ??
        `text-btn text-hover-primary${children ? '' : ` w-${size}px`}`
      }
      onClick={handleDownload}
      disabled={loading}
      title={translate('Download')}
    >
      {loading ? (
        <LoadingSpinner />
      ) : children ? (
        children
      ) : (
        <FileArrowDownIcon weight="bold" size={size} />
      )}
    </button>
  );
};
