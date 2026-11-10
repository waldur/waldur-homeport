import { FC, useEffect } from 'react';

import { setDocumentTitleUnread } from '@/navigation/documentTitle';

import { useMatrixTotalUnread } from './useMatrixTotalUnread';

/**
 * Renderless app-level mirror of the unread chat count into the browser tab
 * title, so it shows without notification permission.
 */
export const MatrixUnreadTitle: FC = () => {
  const unread = useMatrixTotalUnread();
  useEffect(() => {
    setDocumentTitleUnread(unread);
    return () => setDocumentTitleUnread(0);
  }, [unread]);
  return null;
};
